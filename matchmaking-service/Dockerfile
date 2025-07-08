
# --------- Build Stage ---------
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# --------- Runtime Stage ---------
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=builder /app/target/matchmaking-service-*.jar app.jar

# Make sure this matches where your application.properties is in source code
COPY src/main/resources/application.properties ./application.properties

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.config.location=classpath:/,file:./application.properties"]
# The --spring.config.location part forces Spring Boot to pick up the correct file inside Docker.
