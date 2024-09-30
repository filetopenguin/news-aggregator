const express = require('express');
const path = require('path');
require('dotenv').config();
console.log(process.env.API_KEY);
const app = express();
const https = require('https');

//set view engine to ejs
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//serving static files
app.use(express.static('public'));

//get data from api
async function fetchNews(url){
    return new Promise((resolve,reject)=>{
        const options = {
            headers: {
                'User-Agent': 'YourAppName/1.0',  // Set your user agent here
            },
        };
        https.get(url,options,(response)=>{
            let data ='';
            response.on('data',(chunk)=>{
                data+=chunk;
            });

            response.on('end',()=>{
                try{
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                }
                catch(error){
                    reject(error);
                }
            });
            
        }).on('error',(error)=>{
            reject(error);
        })
    })
}

//home route
app.get('/', async(req,res)=>{
    const apiKey = process.env.API_KEY;
    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

    try{
        const data = await fetchNews(url);
        console.log('Fetched Data:', data);  // Debugging line
        console.log('Articles:', data.articles); 
        res.render('home',{articles: data.articles});
    }
    catch(error){
        res.render('error', {message: "failed to get news"});
    }
});


//search news

app.get('/search', async(req,res)=>{
    const query = req.query.q;
    const apiKey = process.env.API_KEY;
    const url =  `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;
    
    try{
        const data = await fetchNews(url);
        if(data.articles.length===0){
            res.render('error', { message: "No articles found for your search." });
        }
        else{
            res.render('search', {articles: data.articles,query});
        }
    } catch(error){
        res.render('error', { message: "Failed to fetch news" });
    }
});

app.listen(3000, ()=>{
    console.log("operating on port 3000");
})