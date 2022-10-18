function formatJSON(data){
    let data_formatted = "";
    let tabs = 0;
    function newLine(){
        let lineBreak = "\n";
        for(let j = 0; j < tabs; j++){
            lineBreak += "\t";
        }
        return lineBreak;
    }

    for(let i = 0; i < data.length; i++){
        if(["}","]"].includes(data[i])){
            tabs--;
            data_formatted += newLine();
        }
        data_formatted += data[i];
        if(["{","["].includes(data[i])){
            tabs++;
            data_formatted += newLine();
        }else if(data[i] === ","){
            data_formatted += newLine();
        }

        if(data[i] === ":"){
            data_formatted += " ";
        }
    }
    return data_formatted;
}

module.exports = formatJSON;