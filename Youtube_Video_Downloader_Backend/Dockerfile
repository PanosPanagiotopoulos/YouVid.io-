# See https://aka.ms/customizecontainer to learn how to customize your debug container 
# and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# Base image for runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
# Install ffmpeg for runtime
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
USER app
WORKDIR /app
EXPOSE 7076
EXPOSE 7077

# Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# Install ffmpeg and yt-dlp for the build process
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg wget \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Youtube_Video_Downloader_Backend.csproj", "."]
RUN dotnet restore "./Youtube_Video_Downloader_Backend.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./Youtube_Video_Downloader_Backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish image
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Youtube_Video_Downloader_Backend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app
COPY certificate.pfx /app/certificate.pfx
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Youtube_Video_Downloader_Backend.dll"]
