$cd = Get-Location

docker build $cd\tgscraper -t tgscraper:latest

Remove-Item -Recurse -Force $cd\schema
mkdir $cd\schema
docker run --rm -v $cd\schema:/out tgscraper:latest app:export-schema --openapi /out/openapi.json

npm i
npm start
