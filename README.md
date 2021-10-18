# Awesome Chat Application | mongodb & sockets & node.js
&#128495; <a href="#">Preview</a>
<h2> Serverside : </h2>
<ul>
  <li> mongodb </li>
  <li> redis-server </li>
  <li> socket.io </li>
  <li> express </li>
  <li> node.js </li>
</ul>
<h2> Clientside : </h2>
<ul>
  <li> EJS </li>
  <li> CSS </li>
  <li> Bootstrap </li>
  <li> Fetch API </li>
  <li> Vanilla js </li>
</ul>
<h2> Features and details : </h2>
<ol>
<li><h4>Login, register and forgot password forms with email authentication using <a href="https://nodemailer.com/about/">nodemailer.js</a></h4></li>
<li><h4>Cookies and express sessions implementation for a more secure exprience of application</h4></li>
<li><h4>Redis server for handling cookies and connections on port 6379</h4></li>
<li><h4>Socket.io module for message transporting and chatrooms</h4></li>
<li><h4>Date and time handling with <a href="https://momentjs.com/docs/">moment.js</a></h4></li>
</ol><br>
<h2> How it works : </h2>
<h5> For email authentication we simply create a 6 digits random number (security code) and send it to the user email.</h5>
<h5> We also use sockets to transport a message with firing events for each message output and input.</h5>
<h5> Saving messages, chats, and users is done with having 3 types of collections in our database.</h5>
<h5> 1) A users collection which saves each single user registered and its joined groups IDs.</h5>
<h5> 2) A groups collection which saves each group's info such as its name, admin, members and image address.</h5>
<h5> 3) Plenty collections (the amount of all the groups ever made) with a name representing a specific group ID. These collections save messages and chats</h5>
<h5> such that each message is considered to be an object with an owner, a text and a date and time field.</h5><br>
<h5> The general structure of the collections below defines how are the collections connected with eachother : </h5>
<pre><code><pre>
  Users Collection: saves a user object
  Groups Collection: saves a group object
  Chatrooms Collection (each group, one collection): saves messsages objects
          {
            first_name (str),
            last_name (str),
User =      username (str, unique),
            email (str, unique),
            password (str)
          }
          {
            name (str),
            admin (username of admin) | (str),
Group =     members (usernames of members divided by ',') | (str),
            image address (str)
          }
                             {
                               owner (object) { name (str), username (str) },
                               message (text itself) | (str),
Messages of a Chatroom =       date (str),
  (ID of a group)              time (str)
                             }
</pre></code></pre>
<h2> Hints : </h2>
<h5> &#128308; Make sure you have <a href="https://docs.mongodb.com">mongodb</a> and <a href="https://redis.io/">redis</a> server installed on your pc if you haven't installed them yet.</h5>
<h5> &#128308; Replace your own email account information in <a href="https://github.com/RezaFirouzii/chat-application_mongodb-nodejs/blob/master/routes/entry-routes/forgot-password.js#L7"> routes/entry-routes/forgot-password.js</a> with myInfo object.</h5>
<h5> &#128308; For avoiding any google account security error (or anyother email hosting service), go to your account setting and enable "Access to a less secure app".</h5>

<br><br><h3> Developed by <a href="https://www.linkedin.com/in/rezafirouzi/">Reza Firouzi</a></h3>
