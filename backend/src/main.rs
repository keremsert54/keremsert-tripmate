use actix_web::{get, post, delete, web, App, HttpResponse, HttpServer, Responder, HttpRequest};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, FromRow, Row};
use dotenv::dotenv;
use std::env;
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{PasswordHash, SaltString};
use argon2::password_hash::rand_core::OsRng;
use jsonwebtoken::{encode, Header, EncodingKey};
use tracing::{info, error, warn};
use chrono::Utc;
use serde_json;

#[derive(Serialize, Deserialize, FromRow)]
struct Trip {
    id: i32,
    title: String,
    destination: String,
    creator_id: i32,
    tags: Vec<String>,
    username: Option<String>, // username Optional olarak tanımlı, SQL JOIN ile doldurulacak
}

#[derive(Deserialize)]
struct CreateTrip {
    title: String,
    destination: String,
    tags: Vec<String>,
}

#[derive(Serialize, Deserialize, FromRow)]
struct User {
    id: i32,
    username: String,
    email: String,
    password_hash: String,
}

#[derive(Deserialize)]
struct CreateUser {
    username: String,
    email: String,
    password: String,
}

#[derive(Deserialize)]
struct Favorite {
    user_id: i32,
    trip_id: i32,
}

#[derive(Serialize, Deserialize)]
struct SuggestedTrip {
    title: String,
    destination: String,
    tags: Vec<String>,
    activities: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

#[get("/trips")]
async fn get_trips(pool: web::Data<PgPool>) -> impl Responder {
    let trips = sqlx::query_as::<_, Trip>(
        "SELECT t.id, t.title, t.destination, t.creator_id, t.tags, u.username 
         FROM trips t 
         LEFT JOIN users u ON t.creator_id = u.id"
    )
    .fetch_all(pool.get_ref())
    .await;

    match trips {
        Ok(trips) => {
            info!("Fetched {} trips", trips.len());
            HttpResponse::Ok().json(trips)
        }
        Err(e) => {
            error!("Error fetching trips: {}", e);
            HttpResponse::InternalServerError().body(format!("Error fetching trips: {}", e))
        }
    }
}

#[post("/trips")]
async fn create_trip(pool: web::Data<PgPool>, trip: web::Json<CreateTrip>, req: HttpRequest) -> impl Responder {
    let user_id = match req.headers().get("User-Id") {
        Some(header) => match header.to_str() {
            Ok(id_str) => id_str.parse::<i32>().unwrap_or(1),
            Err(_) => 1,
        },
        None => 1,
    };
    info!("Creating trip with user_id: {}", user_id);

    // JOIN ile username'i users tablosundan al
    let result = sqlx::query_as::<_, Trip>(
        "INSERT INTO trips (title, destination, creator_id, tags) VALUES ($1, $2, $3, $4) 
         RETURNING id, title, destination, creator_id, tags, 
         (SELECT username FROM users WHERE id = $3) AS username"
    )
    .bind(&trip.title)
    .bind(&trip.destination)
    .bind(user_id)
    .bind(&trip.tags)
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(trip) => {
            info!("Trip added with ID: {} by user {}", trip.id, user_id);
            HttpResponse::Ok().json(trip)
        }
        Err(e) => {
            error!("Error creating trip: {}", e);
            HttpResponse::InternalServerError().body(format!("Error creating trip: {}", e))
        }
    }
}

#[delete("/trips/{id}")]
async fn delete_trip(pool: web::Data<PgPool>, path: web::Path<i32>) -> impl Responder {
    let trip_id = path.into_inner();
    let pool = pool.get_ref();

    let _ = sqlx::query("DELETE FROM favorites WHERE trip_id = $1")
        .bind(trip_id)
        .execute(pool)
        .await
        .map_err(|e| error!("Error removing favorite: {}", e));

    let result = sqlx::query("DELETE FROM trips WHERE id = $1")
        .bind(trip_id)
        .execute(pool)
        .await;

    match result {
        Ok(res) => {
            if res.rows_affected() == 0 {
                return HttpResponse::NotFound().body("Rota bulunamadı");
            }
            info!("Trip deleted: {}", trip_id);
            HttpResponse::Ok().json("Trip deleted successfully")
        }
        Err(e) => {
            error!("Error deleting trip: {}", e);
            HttpResponse::InternalServerError().body(format!("Error deleting trip: {}", e))
        }
    }
}

#[post("/register")]
async fn register(pool: web::Data<PgPool>, user: web::Json<CreateUser>) -> impl Responder {
    info!("Registering user: {}", user.email);
    let argon2 = Argon2::default();
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = match argon2.hash_password(user.password.as_bytes(), &salt) {
        Ok(hash) => hash.to_string(),
        Err(e) => {
            error!("Password hashing failed: {}", e);
            return HttpResponse::InternalServerError().body("Password hashing failed");
        }
    };

    let result = sqlx::query_as::<_, User>(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(&user.username)
    .bind(&user.email)
    .bind(&password_hash)
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(user) => {
            info!("User registered: {}", user.email);
            HttpResponse::Ok().json(user) // user.id ve user.username dönecek
        }
        Err(e) => {
            error!("Error registering user: {}", e);
            HttpResponse::InternalServerError().body(format!("Error registering user: {}", e))
        }
    }
}

#[post("/login")]
async fn login(pool: web::Data<PgPool>, user: web::Json<CreateUser>) -> impl Responder {
    info!("Logging in user: {}", user.email);
    let argon2 = Argon2::default();
    let db_user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&user.email)
        .fetch_optional(pool.get_ref())
        .await;

    match db_user {
        Ok(Some(db_user)) => {
            match PasswordHash::new(&db_user.password_hash) {
                Ok(parsed_hash) => {
                    if argon2.verify_password(user.password.as_bytes(), &parsed_hash).is_ok() {
                        let secret = "your-secret-key";
                        let claims = Claims {
                            sub: db_user.email.clone(),
                            exp: (Utc::now() + chrono::Duration::hours(24)).timestamp() as usize,
                        };
                        let token = match encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref())) {
                            Ok(token) => token,
                            Err(e) => {
                                error!("Token generation failed: {}", e);
                                return HttpResponse::InternalServerError().body("Token generation failed");
                            }
                        };
                        info!("User logged in: {}", db_user.email);
                        HttpResponse::Ok().json(serde_json::json!({"token": token, "user": {"id": db_user.id, "username": db_user.username, "email": db_user.email}}))
                    } else {
                        HttpResponse::Unauthorized().json("Geçersiz şifre")
                    }
                }
                Err(e) => {
                    error!("Password hash parse failed: {}", e);
                    HttpResponse::Unauthorized().json("Şifre doğrulama hatası")
                }
            }
        }
        Ok(None) => HttpResponse::Unauthorized().json("Kullanıcı bulunamadı"),
        Err(e) => {
            error!("Error logging in: {}", e);
            HttpResponse::InternalServerError().body(format!("Error logging in: {}", e))
        }
    }
}

#[post("/favorites")]
async fn add_favorite(pool: web::Data<PgPool>, favorite: web::Json<Favorite>) -> impl Responder {
    let pool = pool.get_ref();
    let trip_exists = sqlx::query("SELECT 1 FROM trips WHERE id = $1")
        .bind(favorite.trip_id)
        .fetch_optional(pool)
        .await;

    match trip_exists {
        Ok(Some(_)) => {
            let result = sqlx::query("INSERT INTO favorites (user_id, trip_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
                .bind(favorite.user_id)
                .bind(favorite.trip_id)
                .execute(pool)
                .await;

            match result {
                Ok(res) => {
                    if res.rows_affected() > 0 {
                        info!("Favorite added: user_id={}, trip_id={}", favorite.user_id, favorite.trip_id);
                        HttpResponse::Ok().json("Favorilere eklendi")
                    } else {
                        info!("Favorite already exists or no action taken: user_id={}, trip_id={}", favorite.user_id, favorite.trip_id);
                        HttpResponse::Ok().json("Favori zaten ekli veya işlem yapılmadı")
                    }
                }
                Err(e) => {
                    error!("Error adding favorite: {}", e);
                    HttpResponse::InternalServerError().body(format!("Error adding favorite: {}", e))
                }
            }
        }
        Ok(None) => {
            warn!("Trip not found: trip_id={}", favorite.trip_id);
            HttpResponse::BadRequest().body("Rota bulunamadı")
        }
        Err(e) => {
            error!("Error checking trip existence: {}", e);
            HttpResponse::InternalServerError().body(format!("Error checking trip existence: {}", e))
        }
    }
}

#[delete("/favorites")]
async fn remove_favorite(pool: web::Data<PgPool>, favorite: web::Json<Favorite>) -> impl Responder {
    let result = sqlx::query("DELETE FROM favorites WHERE user_id = $1 AND trip_id = $2")
        .bind(favorite.user_id)
        .bind(favorite.trip_id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().json("Favorilerden kaldırıldı"),
        Err(e) => {
            error!("Error removing favorite: {}", e);
            HttpResponse::InternalServerError().body(format!("Error removing favorite: {}", e))
        }
    }
}

#[get("/favorites/{user_id}")]
async fn get_favorites(pool: web::Data<PgPool>, path: web::Path<i32>) -> impl Responder {
    let user_id = path.into_inner();
    let result = sqlx::query_as::<_, Trip>(
        "SELECT t.*, u.username FROM trips t 
         JOIN favorites f ON t.id = f.trip_id 
         LEFT JOIN users u ON t.creator_id = u.id 
         WHERE f.user_id = $1"
    )
    .bind(user_id)
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(trips) => HttpResponse::Ok().json(trips),
        Err(e) => {
            error!("Error fetching favorites: {}", e);
            HttpResponse::InternalServerError().body(format!("Error fetching favorites: {}", e))
        }
    }
}

#[post("/suggest-trip")]
async fn suggest_trip(pool: web::Data<PgPool>, trip: web::Json<SuggestedTrip>) -> impl Responder {
    let creator_id = 1;
    let creator_exists = sqlx::query("SELECT 1 FROM users WHERE id = $1")
        .bind(creator_id)
        .fetch_optional(pool.get_ref())
        .await;

    match creator_exists {
        Ok(Some(_)) => {
            let result = sqlx::query(
                "INSERT INTO trips (title, destination, tags, creator_id) VALUES ($1, $2, $3, $4) RETURNING id",
            )
            .bind(&trip.title)
            .bind(&trip.destination)
            .bind(&trip.tags)
            .bind(creator_id)
            .fetch_one(pool.get_ref())
            .await;

            match result {
                Ok(row) => {
                    let trip_id: i32 = row.get("id");
                    info!("Suggested trip added with ID: {}", trip_id);
                    HttpResponse::Ok().json(serde_json::json!({ "id": trip_id }))
                }
                Err(e) => {
                    error!("Error adding suggested trip: {}", e);
                    HttpResponse::InternalServerError().body(format!("Error adding suggested trip: {}", e))
                }
            }
        }
        Ok(None) => {
            warn!("Creator not found: creator_id={}", creator_id);
            HttpResponse::BadRequest().body(format!("Creator with ID {} not found", creator_id))
        }
        Err(e) => {
            error!("Error checking creator existence: {}", e);
            HttpResponse::InternalServerError().body(format!("Error checking creator existence: {}", e))
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();
    info!("Starting server...");

    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    info!("Connecting to database: {}", database_url);
    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    HttpServer::new(move || {
        let cors = Cors::permissive();
        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(get_trips)
            .service(create_trip)
            .service(delete_trip)
            .service(register)
            .service(login)
            .service(add_favorite)
            .service(remove_favorite)
            .service(get_favorites)
            .service(suggest_trip)
    })
    .bind(("127.0.0.1", 8081))?
    .run()
    .await
}