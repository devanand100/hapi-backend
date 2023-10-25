const Cron = require('node-cron');
const User = require('models/user.model').schema;
const fs =  require('fs')
    
const path = require('path')
Cron.schedule('* * * * *' , async ()=> {
    try{
        const serverImagesPath  = path.join(__dirname + "/../../" + "images");
        let databaseImages = await User.find({image:{$exists:true} } , {image:1 , _id:0});

        databaseImages = databaseImages.map((img)=> {
            const imageLink =  img.image.split("/");
            return imageLink[imageLink.length - 1];
        } );

        const serverImages = fs.readdirSync(serverImagesPath); 

        filteredImages = serverImages.filter((img)=>{
            return !databaseImages.some((image)=> image === img)
        })        
        filteredImages.forEach(element => {
            fs.unlinkSync(path.join(serverImagesPath+"/"+element))
        });
        console.log("cleanup service  working..........");

    }catch(err){
        console.log("cleanup service not working..........");
        console.error(err);
    }
   
})
