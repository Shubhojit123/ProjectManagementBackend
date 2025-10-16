exports.chating = async (prompt,role,userId) => {
    try {
        const response = await fetch("http://localhost:3000/rag/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: prompt,role,userId }),
        });
        console.log(response)
        const data = await response.json();  
        return data.answer;
    } catch (error) {
        console.log(error);
        return "Sorry, I am unable to process your request at the moment.";
    }
}


exports.addInPineCone = async (context) => {
    try {
        const response = await fetch("http://localhost:3000/rag/api/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context: context })
        });
        console.log(response)
        const data = await response.json();  
        return data.answer;
    } catch (error) {
        console.log(error);
        return "Sorry, I am unable to process your request at the moment.";
    }
}