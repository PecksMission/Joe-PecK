// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Modal functionality
const modals = {
    story: document.getElementById('storyModal'),
    subscribe: document.getElementById('subscribeModal')
};

// Open modals
document.getElementById('shareStoryBtn').addEventListener('click', () => {
    modals.story.style.display = 'block';
});

document.querySelectorAll('.subscribe-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        modals.subscribe.style.display = 'block';
    });
});

// Close modals
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-modal');
        document.getElementById(modalId).style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// IMPORTANT: Replace these URLs with your actual Google Sheets Web App URLs
// Instructions:
// 1. Create a Google Sheet for each form (one for stories, one for subscriptions)
// 2. Go to Extensions > Apps Script
// 3. Copy the code from the comments below
// 4. Deploy as Web App (Execute as: Me, Access: Anyone)
// 5. Copy the deployment URL and paste it below

const GOOGLE_SHEETS_URLS = {
    story: 'YOUR_STORY_FORM_WEB_APP_URL_HERE',
    subscribe: 'YOUR_SUBSCRIBE_FORM_WEB_APP_URL_HERE'
};

// Share Your Story Form
document.getElementById('storyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.submit-btn');
    const successMsg = document.getElementById('storySuccess');
    const errorMsg = document.getElementById('storyError');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    const formData = {
        name: document.getElementById('storyName').value,
        email: document.getElementById('storyEmail').value,
        story: document.getElementById('storyMessage').value,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(GOOGLE_SHEETS_URLS.story, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // With no-cors mode, we assume success if no error is thrown
        successMsg.style.display = 'block';
        e.target.reset();
        setTimeout(() => {
            modals.story.style.display = 'none';
            successMsg.style.display = 'none';
        }, 3000);
    } catch (error) {
        errorMsg.style.display = 'block';
        console.error('Error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Story';
    }
});

// Subscribe Form
document.getElementById('subscribeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.submit-btn');
    const successMsg = document.getElementById('subscribeSuccess');
    const errorMsg = document.getElementById('subscribeError');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    const formData = {
        name: document.getElementById('subscribeName').value,
        email: document.getElementById('subscribeEmail').value,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(GOOGLE_SHEETS_URLS.subscribe, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // With no-cors mode, we assume success if no error is thrown
        successMsg.style.display = 'block';
        e.target.reset();
        setTimeout(() => {
            modals.subscribe.style.display = 'none';
            successMsg.style.display = 'none';
        }, 3000);
    } catch (error) {
        errorMsg.style.display = 'block';
        console.error('Error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
    }
});

/*
========================================
GOOGLE APPS SCRIPT CODE FOR GOOGLE SHEETS
========================================

Create two separate Google Sheets:
1. One for "Share Your Story" submissions
2. One for "Subscribe" submissions

For each sheet, add these column headers in Row 1:

Story Sheet: Timestamp | Name | Email | Story
Subscribe Sheet: Timestamp | Name | Email

Then go to Extensions > Apps Script and paste this code:

========================================
CODE FOR BOTH SHEETS (same code for each):
========================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // For Story Form
    if (data.story) {
      sheet.appendRow([
        data.timestamp,
        data.name,
        data.email,
        data.story
      ]);
    }
    // For Subscribe Form
    else {
      sheet.appendRow([
        data.timestamp,
        data.name,
        data.email
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

========================================
DEPLOYMENT INSTRUCTIONS:
========================================
1. Click "Deploy" > "New deployment"
2. Click the gear icon next to "Select type" and choose "Web app"
3. Description: "Story Form Handler" or "Subscribe Form Handler"
4. Execute as: "Me"
5. Who has access: "Anyone"
6. Click "Deploy"
7. Copy the Web App URL
8. Paste it into the GOOGLE_SHEETS_URLS object at the top of this file
9. Repeat for the second sheet
*/
