# Build backend Go application
FROM golang:1.24-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go mod tidy
RUN go build -o server .

# Runtime stage
FROM alpine
WORKDIR /app
COPY --from=build /app/server .
EXPOSE 8080
CMD ["./server"]
