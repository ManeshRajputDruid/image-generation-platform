import express from 'express';
const app = express();
const PORT = process.env.PORT || 8000

const {TrainModel, GenerateImage, GenerateImagesFromPack} = require("common/types");

app.post("/ai/training", (req, res) => {

});

app.post("/ai/generate", (req, res) => {
})

app.post("/ai/pack/generate", (req, res) => {
})


app.get("/ai/pack/bulk", (req, res) => {
})

app.get("/ai/images",(req,res)=>{

})




app.listen(PORT, () => {
    console.log("server is running on port ")
});

