# Use the official .NET SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Install ffmpeg and yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg wget \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /src

COPY ["Youtube_Video_Downloader_Backend.csproj", "."]
RUN dotnet restore "./Youtube_Video_Downloader_Backend.csproj"
# Copy the remaining source code
COPY . .
RUN dotnet publish -c Release -o out

# Final stage: runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Install ffmpeg for the runtime image
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /src/.

# Copy the certificate for HTTPS
COPY certificate.pfx /app/certificate.pfx

# Copy the built application from the build stage
COPY --from=build /app/out ./

# Expose the necessary ports
EXPOSE 7076
EXPOSE 7077

# Run the application
ENTRYPOINT ["dotnet", "Youtube_Video_Downloader_Backend.dll"]
