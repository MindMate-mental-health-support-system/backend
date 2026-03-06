const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('--- MindMate Interactive Testing ---');
console.log('Type your message below and press Enter. (Type "exit" or "quit" to stop)\\n');

async function askQuestion() {
    rl.question('You: ', async (text) => {
        if (text.toLowerCase() === 'exit' || text.toLowerCase() === 'quit') {
            console.log('Goodbye!');
            rl.close();
            return;
        }

        if (!text.trim()) {
            return askQuestion();
        }

        try {
            const response = await axios.post('http://localhost:5000/api/data/process', {
                type: 'text',
                text: text,
                userId: 'InteractiveUser'
            });

            const data = response.data.data;
            let botReply = '';

            if (data.isCrisis) {
                botReply = `🚨 [CRISIS DETECTED - ${data.severity}]\\n`;
                botReply += `MindMate: ${data.supportMessage}\\n`;
                botReply += `Keywords: ${data.detectedKeywords?.join(', ')}\\n`;
                botReply += `Resources: ${data.resources?.map(r => r.name + ' (' + r.number + ')').join(' | ')}`;
            } else {
                botReply = `MindMate: ${data.response}\\n`;
                botReply += `Emotion: ${data.detectedEmotion} (${(data.emotionConfidence * 100).toFixed(0)}%)\\n`;
                botReply += `Suggestions: ${data.suggestions?.join(' | ')}`;
            }

            console.log(`\\n${botReply}\\n`);
        } catch (err) {
            if (err.code === 'ECONNREFUSED') {
                console.error('\\n❌ Error: Backend server is not running on localhost:5000. Start it first.\\n');
            } else {
                console.error('\\n❌ Test failed with error:', err.message);
            }
        }

        askQuestion();
    });
}

askQuestion();
