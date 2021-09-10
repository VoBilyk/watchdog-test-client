FROM mcr.microsoft.com/dotnet/aspnet:5.0-focal AS base
ARG PROJECT_PORT
WORKDIR /app
EXPOSE $PROJECT_PORT

FROM mcr.microsoft.com/dotnet/sdk:5.0-focal AS build
WORKDIR /src
COPY ["Thread.NET.WebAPI/Thread.NET.WebAPI.csproj", "Thread.NET.WebAPI/"]
COPY ["Thread.NET.BLL/Thread.NET.BLL.csproj", "Thread.NET.BLL/"]
COPY ["Thread.NET.DAL/Thread.NET.DAL.csproj", "Thread.NET.DAL/"]
COPY ["Thread.NET.Common/Thread.NET.Common.csproj", "Thread.NET.Common/"]

RUN dotnet restore "Thread.NET.WebAPI/Thread.NET.WebAPI.csproj"
COPY . .
WORKDIR "/src/Thread.NET.WebAPI"
RUN dotnet build "Thread.NET.WebAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Thread.NET.WebAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Thread.NET.WebAPI.dll"]