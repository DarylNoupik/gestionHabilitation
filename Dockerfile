# Use Node 16 alpine as parent image
FROM node:16

#RUN apt-get update && \
#    apt-get install -y python3 && \
#    apt-get clean

#dependances linux pour msnodesqlv8
RUN apt-get update && apt-get install -y curl gnupg2 && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 unixodbc-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/* \

WORKDIR /app

COPY  package*.json ./

RUN npm install -g npm@9.5.1

RUN npm install msnodesqlv8 --save

RUN npm install

COPY . .
# Expose application port
EXPOSE 4000

# Start the application
CMD [ "node", "index.js" ]
