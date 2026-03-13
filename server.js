
const express = require("express")
const fs = require("fs")
const path = require("path")

const app = express()

app.use(express.json())
app.use(express.static("public"))
app.use("/admin", express.static("admin"))

/* TELEGRAM ENV */

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID


/* FILES */

const vacanciesFile = "vacancies.json"
const applicationsFile = "applications.json"


if(!fs.existsSync(vacanciesFile)){
fs.writeFileSync(vacanciesFile,"[]")
}

if(!fs.existsSync(applicationsFile)){
fs.writeFileSync(applicationsFile,"[]")
}



/* GET VACANCIES */

app.get("/vacancies",(req,res)=>{

const vacancies = JSON.parse(fs.readFileSync(vacanciesFile))

res.json(vacancies)

})



/* ADD VACANCY */

app.post("/vacancies",(req,res)=>{

const vacancies = JSON.parse(fs.readFileSync(vacanciesFile))

const vacancy = {
id: Date.now(),
title:req.body.title,
city:req.body.city,
salary:req.body.salary,
language:req.body.language,
description:req.body.description
}

vacancies.push(vacancy)

fs.writeFileSync(vacanciesFile,JSON.stringify(vacancies,null,2))

res.json({success:true})

})



/* DELETE VACANCY */

app.delete("/vacancies/:id",(req,res)=>{

let vacancies = JSON.parse(fs.readFileSync(vacanciesFile))

vacancies = vacancies.filter(v=>v.id != req.params.id)

fs.writeFileSync(vacanciesFile,JSON.stringify(vacancies,null,2))

res.json({success:true})

})



/* APPLY */

app.post("/apply", async (req,res)=>{

console.log("APPLICATION RECEIVED:", req.body)

const data = req.body

const apps = JSON.parse(fs.readFileSync(applicationsFile))

apps.push({
date:new Date(),
...data
})

fs.writeFileSync(applicationsFile,JSON.stringify(apps,null,2))


const message =

`📩 Нова заявка

Вакансія: ${data.vacancy}

Ім'я: ${data.name}
Телефон: ${data.phone}
Telegram: ${data.telegram}
Місто: ${data.city}

Рівень мови: ${data.languageLevel}
Досвід: ${data.experience}
Вік: ${data.age}
`


try{

const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

chat_id: CHAT_ID,
text: message,

reply_markup:{
inline_keyboard:[
[
{
text:"💬 Відкрити Telegram кандидата",
url:`https://t.me/${data.telegram.replace("@","")}`
}
]
]
}

})

})

const result = await response.json()

console.log("TELEGRAM RESPONSE:", result)

}catch(error){

console.log("TELEGRAM ERROR:", error)

}

res.json({success:true})

})



/* START SERVER */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{

console.log("WORKOFFICE running on port",PORT)

})


