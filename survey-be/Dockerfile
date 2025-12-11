FROM maven:3-amazoncorretto-25-alpine AS maven
WORKDIR /usr/src/app
COPY pom.xml .

RUN mvn dependency:go-offline > /dev/null

COPY . .

RUN mvn -DskipTests clean compile package > /dev/null

FROM openjdk:25-ea-slim
COPY --from=maven /usr/src/app/target/survey-*.jar app.jar
ENV JAVA_OPTS="-Xms512m -Xmx1024m" 
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
