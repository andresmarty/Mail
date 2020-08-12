document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');

  // send E-Mails
  document.querySelector('#compose-form').addEventListener('submit', send_email);

});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none'

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none'

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  const parent = document.getElementById("header");
  while (parent.firstChild) {
      parent.firstChild.remove();
  }

  const text = document.getElementById("body");
  while (text.firstChild) {
      text.firstChild.remove();
  }

  // Show E-Mails

  if (mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)

      emailLenght = Object.keys(emails).length; 
  
      if (emailLenght !== 0) {

        const unorder = document.createElement('ul')
        unorder.className = 'unorder'
        document.querySelector('h3').appendChild(unorder)


        emails.forEach(mail => {
          
          const list = document.createElement('li');
          list.id = mail.id
          list.onclick = () => {
            list.value = mail.id;
            enter_email(list.value);
            fetch(`/emails/${mail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
          });
          }

          if (mail.read === false){
            list.className = 'list'
          } else {
            list.className = 'readMail'
          }

          unorder.appendChild(list);
          
          const sender = document.createElement('p');
          sender.className = 'title'
          sender.innerHTML = mail.sender
          list.appendChild(sender)

          const subject = document.createElement('p');
          subject.className = 'subject'
          subject.innerHTML = mail.subject
          list.appendChild(subject)

          const timeStamp = document.createElement('p');
          timeStamp.className = 'timeStamp'
          timeStamp.innerHTML = mail.timestamp
          list.appendChild(timeStamp)

        });
      }; 
    });
  };
};



function send_email() {
    // Select the content of the inbox
    const recipient = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Send the email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipient,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  };


function enter_email(id) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';


  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      const header = document.querySelector('#header')
      
      const from = document.createElement('p');
      from.className = 'from'
      from.innerHTML = `From: ${email.sender}`
      header.appendChild(from)
      
      const to = document.createElement('p');
      to.className = 'to'
      to.innerHTML = `To: ${email.recipients[0]}`
      header.appendChild(to)

      const subject = document.createElement('p');
      subject.className = 'subjectInbox'
      subject.innerHTML = `Subject: ${email.subject}`
      header.appendChild(subject)

      const timeStamp = document.createElement('p');
      timeStamp.className = 'timeStampInbox'
      timeStamp.innerHTML = `TimeStamp: ${email.timestamp}`
      header.appendChild(timeStamp)

      const div2 = document.createElement('p')
      div2.innerHTML = email.body
      document.querySelector('#body').append(div2)

      const button = document.createElement('button');
      button.className = 'btn btn-sm btn-outline-primary'
      button.innerHTML = 'Reply'
      button.id = 'reply'
      button.onclick = () => {
        reply(id)
      }
      header.append(button)

      const archivedButton = document.createElement('button');
      archivedButton.className = 'btn btn-sm btn-outline-secondary'
      archivedButton.innerHTML = 'Archive'
      archivedButton.id = 'archivedButton'
      header.append(archivedButton)
      archivedButton.onclick = () => {
        if (email.archived) {
          desarchive(id)
          archivedButton.innerHTML = 'Desarchived'
        } else {
         archive(id)
         archivedButton.innerHTML = 'Mail Archived'
        };
        
  };
});

function archive(id) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
}

function desarchive(id) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
};
}

function reply(id) {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email').style.display = 'none'
  

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = email.subject;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.recipients} wrote:
    ${email.body}`;
  });
};





