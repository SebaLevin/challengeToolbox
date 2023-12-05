import express from "express";
import axios from "axios";
import fs from "fs";
import { error } from "console";

const app = express();

app.get('/files/data', async (req, res) => {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://echo-serv.tbxnet.com/v1/secret/files',
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer aSuperSecretKey'
            }

        })

        res.status(200).json(response.data)

    

        response.data.files.forEach(async (file) => {

         
                
              
                // Write the CSV data to a local file
                
            const dataFile = await axios({
                method: 'get',
                url: `https://echo-serv.tbxnet.com/v1/secret/file/${file}`,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer aSuperSecretKey'
                }

            }).then(data => {
                return data.data
            }).catch(error => {
                console.log(error.message)
            })
            
            const rows = dataFile.trim().split('\n');
            const headers = rows[0].split(',');
         
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',');

                if (values.every(value => value === undefined || value.trim() === '')) {
                    // Skip the entire row if all values are undefined or blank
                    continue;
                }
            
                // Create an object using headers as keys and row values as values
                const obj = {};
                let shouldSkip = false;
            
                for (let j = 0; j < headers.length; j++) {
                    // Check if the property is undefined or a blank string
                    if (values[j] === undefined || values[j].trim() === '') {
                        shouldSkip = true;
                        break;  // Skip the entire row
                    }
            
                    obj[headers[j]] = values[j];
                }
            
                // If shouldSkip is true, skip the current row
                if (!shouldSkip) {
    
                    (async () => {
                    
                    try {
                         fs.writeFile('data.txt', JSON.stringify(obj), () => {
                            console.log(obj)
                        });
                    } catch (error) {
                        console.log(error.message)
                    }
                        
                    })();
                }
            }

            
        })

    }catch (error) {
        res.status(500).send(error.message)
    }

})


app.listen(3000, () => {
    console.log("Server listening on port 3000")
})