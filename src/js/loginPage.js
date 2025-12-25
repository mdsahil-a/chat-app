const loginButton=document.querySelector("#loginButton");
const url="https://chat-app-server-1-fsk4.onrender.com"
// const url="http://localhost:3000";


loginButton.addEventListener("click",async(event)=>{
event.preventDefault();
 
const email=document.querySelector("#email").value;
const password=document.querySelector("#password").value;
try{
const response=await axios.post(`${url}/api/auth/login`,
    {
        email,
        password
    }
);

localStorage.setItem("token", response.data.token);
  

   await showToast(response.data.message,"success");

   window.location='chatPage.html';

}
catch(error){
    showToast(error.response?.data?.message || error.message,"error");
}
});



