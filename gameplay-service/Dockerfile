
# --------- Build Stage ---------

# base image - eclipse temurin with jdk 21
FROM eclipse-temurin:21-jdk AS builder

# set working dir inside the container
WORKDIR /app

# copy all project files into the container (incl. source code and maven wrapper)
COPY . .

# Use the Maven wrapper to clean and package the application
# -DskipTests skips running tests during the build to speed it up
RUN ./mvnw clean package -DskipTests


# --------- Runtime Stage ---------

# Start a new image using the same base JDK, but this one will only run the built JAR
FROM eclipse-temurin:21-jdk

# set working dir inside the container
WORKDIR /app

# Copy the packaged JAR file from the builder stage into this runtime image
# This uses a wildcard to match the actual versioned JAR name like matchmaking-service-0.0.1-SNAPSHOT.jar
COPY --from=builder /app/target/gameplay-service-*.jar app.jar

# Copy the application.properties file from your source directory into the container
# This ensures Spring Boot picks up your custom configuration when running inside Docker
# Make sure this matches where your application.properties is in source code
COPY src/main/resources/application.properties ./application.properties

# expose port 8081 so that the container can receive traffic on this port
EXPOSE 8082

# Start the Spring Boot application
# --spring.config.location tells Spring where to look for configuration:
#   - classpath:/ to allow it to load bundled defaults
#   - file:./application.properties to ensure the external file inside the Docker image is used
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.config.location=classpath:/,file:./application.properties"]
# The --spring.config.location part forces Spring Boot to pick up the correct file inside Docker.
