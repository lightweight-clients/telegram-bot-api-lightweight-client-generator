$image = "telegram-bot-api-lightweight-client-generator:latest"

Write-Host "Cleaning up output folder"
Remove-Item -Recurse -Force output

Write-Host "Building $image"
docker build -t $image --progress=plain . # --no-cache

Write-Host "Copying results"
docker run --rm -v ${PWD}/output:/container-artifacts $image cp -r /results/. /container-artifacts/

Write-Host "Removing $image"
docker image remove $image

Write-Host "Done"
