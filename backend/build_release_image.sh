#!/bin/bash

wdir=$(pwd)
mkdir temp
tmpDir=$? 
imageName="registry.digitalocean.com/wizard/ddocuments/backend"
dependencies="registry.digitalocean.com/wizard/ddocuments/backend-dependencies"
buildDirectory="dynamic-documents/backend"
if [ "$tmpDir" == 0 ]; then
    # Clone repository in temporal directory
    cd temp
    git clone --single-branch --branch release https://github.com/RobertoLangarica/dynamic-documents.git
    clone=$?
    if [ "$clone" == 0 ]; then
        cd $buildDirectory
        version=$(grep -w -i '"version"' package.json | cut -d '"' -f 4)
        img1=$imageName:$version
        img2=$imageName
        # First we get the newest version of dependencies
        docker pull $dependencies
        docker build -t $img1 -t $img2 .
        built=$?
        if [ "$built" == 0 ]; then
            docker push $img1
            docker push $img2
        fi
    fi
    
    ######CLEANUP
    cd $wdir
    # git removes the write access to some files
    chmod -R +w temp
    # Remove the cloned repository
    rm -r temp

    if [ "$built" == 0 ]; then
        echo 'Build v-'$version' COMPLETED'
    else
        echo 'A problem ocurred while creating the build image'
    fi

else 
echo 'Unable to create directory temp'
fi