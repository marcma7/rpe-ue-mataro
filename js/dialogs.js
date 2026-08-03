function closeDialog(){
    document.getElementById("dialogOverlay").style.display="none";
}


function showDialog(title,message,buttons){
    document.getElementById("dialogTitle").textContent = title;
    document.getElementById("dialogMessage").textContent = message;
    const container = document.getElementById("dialogButtons");

    container.innerHTML="";

    buttons.forEach(button=>{
        const b = document.createElement("button");
        b.textContent = button.text;
        b.onclick = ()=>{
            closeDialog();
            if(button.action) button.action();
        };

        container.appendChild(b);
    });

    document.getElementById("dialogOverlay").style.display = "flex";
}
