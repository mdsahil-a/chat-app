const groupWrapper=document.querySelector(".groupWrapper");
const friendWrapper=document.querySelector(".friendWrapper");
const authorImage=document.querySelector("#authorImage");
const search=document.querySelector("#search");
const result=document.querySelector(".result");
const userName=document.querySelector("#userName");
const userPic=document.querySelector("#userPic");
const send=document.querySelector(".send");
const logout=document.querySelector(".logout");
const logoutPage=document.querySelector(".logoutPage");
const logoutYes=document.querySelector("#logoutYes");
const logoutNo=document.querySelector("#logoutNo");
const noti_list=document.querySelector("#notiList");
const notiBadge=document.querySelector("#notiBadge");
const userPage=document.querySelector(".userPage");
const chatBox=document.querySelector(".chatBox");


// const noti_icon=document.querySelector("#notiIcon");
// const home=document.querySelector("#homeIcon");
const navItems=document.querySelectorAll(".nav-item");
const url="https://chat-app-server-1-fsk4.onrender.com";
// const url="http://localhost:3000"
pages=document.querySelectorAll(".page");
let currentPage;
navItems.forEach(item=>{
item.addEventListener("click",()=>{
 navItems.forEach(i=> i.classList.remove('active'));
 pages.forEach(page=>page.classList.add("hidden"));
  logoutPage.classList.add("hidden");

 item.classList.add("active");
if(item.dataset.page=="logout"){
  return ;
}

// Update body background based on active page
document.body.className = ''; // Clear all background classes
const pageName = item.dataset.page;
if(pageName === 'home') {
  document.body.classList.add('home-active');
} else if(pageName === 'chat') {
  document.body.classList.add('chat-active');
} else if(pageName === 'notification') {
  document.body.classList.add('notification-active');
} else if(pageName === 'setting') {
  document.body.classList.add('setting-active');
}

document.getElementById(item.dataset.page).classList.remove('hidden');
if(item.dataset.page === 'chat') {
  document.querySelector(".userPage").classList.remove("hidden");
}

})
  
})


function showPeoples(){
chatBox.classList.add("hide");
  userPage.classList.remove("hide");



}
const date=new Date();
// console.log(`${date.getHours()}:${date.getMinutes()}${date.getHours()>12?"pm":"am"}`);
const i=document.querySelectorAll("i");


const socket=io(url);

let userId;




logout.addEventListener("click",()=>{
logoutPage.classList.toggle("hidden");
});
  
logoutYes.addEventListener("click",()=>{
  localStorage.setItem("token","");
  window.location="loginPage.html";
});

logoutNo.addEventListener("click",()=>{
  logoutPage.classList.add("hidden");
})


window.onload=async()=>{

const token=localStorage.getItem('token');
try{
  if(!token){
    window.location='loginPage.html';
    return;
  }//   http://localhost:3000   


const res=await axios.post(`${url}/api/auth/checkAuth`,{token});
 userId= res.data._id;
 authorImage.src=res.data.profilePic;


        

}
catch(error){

    console.log("Error ",error.message);
}


loadusers();
loadNotification();
socket.emit("join",userId);

// Set initial background for home page
document.body.classList.add('home-active');
}

authorImage.addEventListener("click",()=>{
    window.location='profilePage.html'
});


search.addEventListener("input",async()=>{

 const name=document.querySelector("#search").value;
if(name==""){
  result.style.display="none";
}
else{
  result.style.display="inline";
}

try{
 const res=await axios.post(`${url}/api/friend/search`,{name});

 const users=res.data;
result.innerHTML="";
users.forEach(user=>{

    result.innerHTML+=`
    <div class="peoples">
<div class="peopleDetails">
  <img src="${user.profilePic}" id="peopleImage" alt="">
  <span>${user.fullName}</span>
</div>
<button id="sendMessage" onclick="addUser('${user._id}')">Message</button>
</div>
    `


});



}

catch(error){
    console.log(error.message);
}

});


const addUser=async (receiverId)=>{
console.log(userId)
    try{
const res=await axios.post(`${url}/api/friend/send`,{userId,receiverId});

sendNotification(receiverId);
    }
    catch(error){
        console.log(error.message);

    }


}

const loadusers=async()=>{
const res=await axios.post(`${url}/api/friend/getUsers`,{userId});
const users=res.data;

users.forEach(user=>{

   const id=userId==user.sender?user.receiver:user.sender;
   findUser(id).then(details=>{

    friendWrapper.innerHTML+=`

    <div class="friend " onclick="appenChat('${id}','${details.data.fullName}','${details.data.profilePic}','${details.data.isOnline}')">
  <div class="friendDetails">
<img src="${details.data.profilePic}" alt="" id="friendImage">
<div class="friendInfo">
  <span id="friendName">${details.data.fullName}</span>
  <span id="friendRecentMessage">Alright</span>
</div>
  </div>
  <span id="friendMessageDate">Monday,7:12pm</span>
</div>
    `

   });

})
}



const findUser=async(id)=>{
try{
    const res=await axios.post(`${url}/api/auth/find`,{id});
 
    return res;
}
catch(error){
    console.log(error.message);
}

}

const appenChat=async(id,name,pic,status)=>{
console.log(status)
userPage.classList.add("hide");
chatBox.classList.remove("hide");


document.querySelector(".chatBox").innerHTML=`
<div class="chatNav">

  <div class="userDetails">
<img src=${pic} alt="" id="userPic">

<div class="userInfo">
  <span id="userName">${name}</span>
  <span id="status">${status=='true'?"Online":"Offline"}</span>
</div>
  </div>

  <div class="options">
    <span id="call"><i class="fa-solid fa-phone-volume"></i></span>
    <span id="v-call"><i class="fa-solid fa-video"></i></span>
    <span id="more"><i class="fa-solid fa-bars"></i></span>
  </div>
</div>

<div class="messageDiv">


</div>


<div class="inputDiv">

  <input type="text" class="inputMessage" placeholder="Type message...">
  <button class="send" onclick="sendMessage('${id}')"><i class="fa-solid fa-paper-plane"></i></button>
</div>
`
// socket.on("updateUserStatus", ({ userId, isOnline, lastSeen }) => {

//   if (isOnline) {
//     el.innerText = "🟢 Online";
//   } else {
//     el.innerText = "Last seen: " + new Date(lastSeen).toLocaleString();
//   }
// });

loadChat(id);

}



function sendMessage(receiverId){
    const senderId=userId
    const msg=document.querySelector(".inputMessage").value;

    socket.emit("sendMessage",{senderId,receiverId,msg});
    document.querySelector(".inputMessage").value="";
}

socket.on("receiveMessage",(msg)=>{
console.log(msg);
             const currentTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const messageDiv= document.querySelector(".messageDiv");
  const user=userId==msg.sender?"sender":"reciever";
  const userDate=userId==msg.sender?"senderDate":"recieverDate";
  console.log(user)
  messageDiv.innerHTML+=`<div class="${user}">
  <span id="${user}">${msg.message}</span>
  <span id="${userDate}">${currentTime}</span>
</div>`

})

const loadChat=async(id)=>{

    try{
        const res=await axios.post(`${url}/api/message/loadMessage`,{userId,id});
        const messages=res.data;
        messages.forEach(message=>{
             const currentTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          console.log(currentTime)
    const messageDiv= document.querySelector(".messageDiv");
  const user=userId==message.sender?"sender":"reciever";
  const userDate=userId==message.sender?"senderDate":"recieverDate";
 
  messageDiv.innerHTML+=`<div class="${user}">
  <span id="${user}">${message.message}</span>
  <span id="${userDate}">${currentTime}</span>
</div>`
        })
    
    }
    catch(error){
        console.log(error.message);

    }

}


// socket.on("updateUserStatus", ({ userId, isOnline }) => {
//   const el = document.getElementById(`status-${userId}`);
//   if (isOnline) {
//     el.innerText = "🟢 Online";
//   } else {
//     el.innerText = "🔴 Offline";
//   }
// });


// Format date helper function
const formatNotificationDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const loadNotification=async()=>{
  try{
    const res=await axios.post(`${url}/api/auth/loadNotification`,{userId});
    const notifications = res.data;
    
    // Update badge count
    if(notifications.length > 0) {
      notiBadge.textContent = notifications.length > 99 ? '99+' : notifications.length;
      notiBadge.classList.remove('hidden');
    } else {
      notiBadge.classList.add('hidden');
    }

    // Clear existing notifications
    noti_list.innerHTML = '';

    if(notifications.length === 0) {
      noti_list.innerHTML = `
        <div class="noti_empty">
          <i class="fa-solid fa-bell-slash"></i>
          <span>No notifications yet</span>
        </div>
      `;
      return;
    }

    // Render notifications
    notifications.forEach(noti => {
      const notiCard = document.createElement('div');
      notiCard.className = 'noti_card';
      notiCard.innerHTML = `
        <img src="${noti.profilePic || '../../public/avatar.jpeg'}" alt="${noti.userName}">
        <div class="noti_details">
          <span class="noti_user_name">${noti.userName}</span>
          <span class="noti_message_text">${noti.message}</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
          <span class="noti_date">${formatNotificationDate(noti.createdAt)}</span>
          <button class="noti_delete" onclick="deleteNotification('${noti._id}')" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      noti_list.appendChild(notiCard);
    });
  }
  catch(error){
    console.log("Error loading notifications:", error.message);
  }
}

const deleteNotification=async(id)=>{
  try{
    const res=await axios.post(`${url}/api/auth/deleteNotification`,{id});
    console.log(res.data.message);
    loadNotification(); // Reload notifications after deletion
  }
  catch(error){
    console.log("Error deleting notification:", error.message);
  }
}

const clearAllNotifications=async()=>{
  try{
    const res=await axios.post(`${url}/api/auth/loadNotification`,{userId});
    const notifications = res.data;
    
    // Delete all notifications
    for(const noti of notifications) {
      await axios.post(`${url}/api/auth/deleteNotification`,{id: noti._id});
    }
    
    loadNotification(); // Reload to show empty state
  }
  catch(error){
    console.log("Error clearing notifications:", error.message);
  }
}

const sendNotification=async(recieverId)=>{
const message="Added you"

  try{

    const res=await axios.post(`${url}/api/auth/sendNotification`,{userId,recieverId,message});

  }
  catch(error){
    console.log(error.message);

  }

}

// Settings Functions
const toggleDarkMode=()=>{
  const isDark = document.getElementById('darkModeToggle').checked;
  localStorage.setItem('darkMode', isDark);
  // Apply dark mode styles if needed
  if(isDark) {
    document.body.style.filter = 'brightness(0.8)';
  } else {
    document.body.style.filter = 'brightness(1)';
  }
}

const changeThemeColor=()=>{
  const color = document.getElementById('themeColor').value;
  localStorage.setItem('themeColor', color);
  // Apply theme color changes
  console.log('Theme color changed to:', color);
}

const togglePushNotifications=()=>{
  const enabled = document.getElementById('pushNotifications').checked;
  localStorage.setItem('pushNotifications', enabled);
  console.log('Push notifications:', enabled ? 'enabled' : 'disabled');
}

const toggleSoundAlerts=()=>{
  const enabled = document.getElementById('soundAlerts').checked;
  localStorage.setItem('soundAlerts', enabled);
  console.log('Sound alerts:', enabled ? 'enabled' : 'disabled');
}

const toggleEmailNotifications=()=>{
  const enabled = document.getElementById('emailNotifications').checked;
  localStorage.setItem('emailNotifications', enabled);
  console.log('Email notifications:', enabled ? 'enabled' : 'disabled');
}

const toggleOnlineStatus=()=>{
  const enabled = document.getElementById('onlineStatus').checked;
  localStorage.setItem('onlineStatus', enabled);
  console.log('Online status:', enabled ? 'visible' : 'hidden');
}

const toggleReadReceipts=()=>{
  const enabled = document.getElementById('readReceipts').checked;
  localStorage.setItem('readReceipts', enabled);
  console.log('Read receipts:', enabled ? 'enabled' : 'disabled');
}

const changeProfileVisibility=()=>{
  const visibility = document.getElementById('profileVisibility').value;
  localStorage.setItem('profileVisibility', visibility);
  console.log('Profile visibility:', visibility);
}

const changePassword=()=>{
  const newPassword = prompt('Enter new password:');
  if(newPassword) {
    // Implement password change logic
    console.log('Password change requested');
    alert('Password change feature coming soon!');
  }
}

const deleteAccount=()=>{
  if(confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    // Implement account deletion logic
    console.log('Account deletion requested');
    alert('Account deletion feature coming soon!');
  }
}

// Load saved settings on page load
window.addEventListener('DOMContentLoaded', () => {
  // Load notification settings
  const pushNoti = localStorage.getItem('pushNotifications');
  if(pushNoti !== null) {
    document.getElementById('pushNotifications').checked = pushNoti === 'true';
  }
  
  const soundAlerts = localStorage.getItem('soundAlerts');
  if(soundAlerts !== null) {
    document.getElementById('soundAlerts').checked = soundAlerts === 'true';
  }
  
  const emailNoti = localStorage.getItem('emailNotifications');
  if(emailNoti !== null) {
    document.getElementById('emailNotifications').checked = emailNoti === 'true';
  }
  
  const onlineStatus = localStorage.getItem('onlineStatus');
  if(onlineStatus !== null) {
    document.getElementById('onlineStatus').checked = onlineStatus === 'true';
  }
  
  const readReceipts = localStorage.getItem('readReceipts');
  if(readReceipts !== null) {
    document.getElementById('readReceipts').checked = readReceipts === 'true';
  }
  
  const profileVisibility = localStorage.getItem('profileVisibility');
  if(profileVisibility) {
    document.getElementById('profileVisibility').value = profileVisibility;
  }
  
  const themeColor = localStorage.getItem('themeColor');
  if(themeColor) {
    document.getElementById('themeColor').value = themeColor;
  }
  
  const darkMode = localStorage.getItem('darkMode');
  if(darkMode !== null) {
    document.getElementById('darkModeToggle').checked = darkMode === 'true';
    toggleDarkMode();
  }
});
