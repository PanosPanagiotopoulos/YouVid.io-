# Stage 1: Build the Angular frontend
FROM node:20 AS frontend-builder
WORKDIR /app

# Copy Angular app package configuration and install dependencies
COPY Youtube_Video_Downloader_Frontend/package*.json ./
RUN npm install --force

# Copy Angular source code and build the application
COPY Youtube_Video_Downloader_Frontend/ ./
RUN npm run build --prod

# Debugging: Verify build output
RUN ls -R /app/dist/demo/browser

# Stage 2: Build the .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-builder
WORKDIR /src

# Copy .NET project files and restore dependencies
COPY Youtube_Video_Downloader_Backend/Youtube_Video_Downloader_Backend.csproj ./
RUN dotnet restore Youtube_Video_Downloader_Backend.csproj

# Copy the remaining backend source code
COPY Youtube_Video_Downloader_Backend/ ./
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install ffmpeg for media processing
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY Youtube_Video_Downloader_Backend/cookies.json /app/cookies.json
# Copy HTTPS certificate for secure communication
COPY Youtube_Video_Downloader_Backend/certificate.pfx /app/certificate.pfx

# Copy the published .NET backend from the builder stage
COPY --from=backend-builder /app/publish ./

# Copy the built Angular frontend files into the backend's wwwroot folder
COPY --from=frontend-builder /app/dist/demo/browser ./wwwroot

# Expose ports for HTTP and HTTPS
EXPOSE 443
EXPOSE 7077

# Run the application
ENTRYPOINT ["dotnet", "Youtube_Video_Downloader_Backend.dll"]
