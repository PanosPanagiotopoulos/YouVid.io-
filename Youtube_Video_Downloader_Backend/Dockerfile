# Use the official .NET image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the remaining source code
COPY . ./

# Build the application
RUN dotnet publish -c Release -o out

# Use the runtime image for the final build
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copy the built application
COPY --from=build /app/out .

# Expose the necessary port
EXPOSE 7076

# Run the application
ENTRYPOINT ["dotnet", "Youtube_Video_Downloader_Backend.dll"]
