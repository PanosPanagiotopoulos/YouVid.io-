# Stage 1: Base Image for Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
# Install ffmpeg for runtime
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 7076
EXPOSE 7077

# Stage 2: Build Image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# Install ffmpeg and wget for the build process
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg wget \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy the .csproj and restore as distinct layers
COPY ["Youtube_Video_Downloader_Backend.csproj", "./"]
# Verify the presence of the .csproj file
RUN ls -la /src
RUN dotnet restore "./Youtube_Video_Downloader_Backend.csproj"

# Copy the remaining source code and build
COPY . .
# Verify the presence of all files
RUN ls -la /src
RUN dotnet build "./Youtube_Video_Downloader_Backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Stage 3: Publish Image
FROM build AS publish
RUN dotnet publish "./Youtube_Video_Downloader_Backend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 4: Final Image
FROM base AS final
WORKDIR /app
COPY certificate.pfx /app/certificate.pfx
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Youtube_Video_Downloader_Backend.dll"]