// Script to send 10 POST requests to http://localhost:5001/add with random UIDs and sample data
const { execSync } = require('child_process');

const sampleUsernames = ['JohnDoe', 'JaneSmith', 'AlexRivera', 'SamTaylor', 'ChrisJordan', 'PatMorgan', 'TaylorReed', 'MorganLee', 'JordanCasey', 'AverySkyler'];


function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDigits(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function generateRandomUser() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const username = getRandomElement(sampleUsernames);
  const uid = `user-${Date.now()}-${randomNum}`;
  const email = `${username.toLowerCase()}_${randomNum}@example.com`;
  const phonenumber = `+1${getRandomDigits(10)}`;

  return { uid, username, email, phonenumber };
}

async function runTestRequests() {
  console.log("=================================================");
  console.log("Starting script: Sending 10 POST requests to http://localhost:5001/add");

  console.log("=================================================\n");

  const totalRequests = 10;
  let successCount = 0;

  for (let i = 1; i <= totalRequests; i++) {
    const userData = generateRandomUser();
    const payloadJson = JSON.stringify(userData);

    console.log(`[Request ${i}/${totalRequests}] Sending POST data for UID: ${userData.uid}...`);

    try {
      // Execute cURL command to http://localhost:5001/add without App Check token header
      const curlCommand = `curl -s -X POST http://localhost:5001/add -H "Content-Type: application/json" -d '${payloadJson}'`;



      const responseOutput = execSync(curlCommand, { encoding: 'utf-8' });

      console.log(`  Payload : ${payloadJson}`);
      console.log(`  Response: ${responseOutput.trim()}\n`);

      const parsed = JSON.parse(responseOutput);
      if (parsed.success) {
        successCount++;
      }
    } catch (error) {
      console.error(`  Error running request ${i}:`, error.message, '\n');
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log("=================================================");
  console.log(`Finished! Successfully posted ${successCount}/${totalRequests} entries.`);
  console.log("=================================================");
}

runTestRequests();
