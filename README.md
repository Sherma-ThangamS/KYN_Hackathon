# Newsify: A News Aggregator Application

**Newsify** is a news aggregator application designed to enhance community awareness by curating and sharing news from verified local sources. This project is a solution to the problem statement provided in the **News and Information Track**, aimed at delivering accurate, relevant, and personalized news to users.

---

## Features

### 1. Aggregation from Verified Sources
Newsify uses the **newsdata.io API** to collect news exclusively from verified local sources, ensuring the authenticity and reliability of the information shared.

### 2. Content Categorization
News articles are categorized into various topics such as politics, technology, health, sports, entertainment, and more, allowing users to easily navigate and explore their interests.

### 3. Personalized News Feeds
The application provides users with a personalized news feed by leveraging their previous interactions with the platform. Personalized content is based on:
- Articles previously viewed.
- User likes and dislikes.

### 4. Like/Dislike Feature
Users can express their preferences for news articles by liking or disliking them, contributing to further personalization and improving the user experience.

### 5. Text-to-Audio Feature
Newsify incorporates a **text-to-audio** feature, enabling users to listen to news articles, making the app accessible to visually impaired users or those who prefer an audio format.

### 6. AI-Powered Summarization
The application uses **AI summarization** to generate concise summaries of news articles, helping users quickly grasp the essence of the content without reading lengthy texts.

---

## Technology Stack

- **API**: [newsdata.io](https://newsdata.io/)
- **Frontend**: React.js,Tailwind CSS
- **Backend**: Node.js 
- **AI Summarization**: Gemini-1.5-pro-latest
- **Text-to-Audio**: ResponsiveVoice JS

---

## How to Run the Application

1. **Clone the Repository**
   ```bash
   git clone  https://github.com/Sherma-ThangamS/KYN_Hackathon.git
   cd newsify
   ```
   
2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Set Up Environment Variables** \
    Create a .env file and include the following:
    ```bash
    REACT_APP_GEM_API=Your_Gemini_API_Key
    REACT_APP_NEWS_DATA_API_KEY=Your_News_Data_API_Key
    ```
    
4. **Start the Application**
    ```bash
    npm start
    ```
    
5. **Access the Application** \
    Open your browser and navigate to http://localhost:3000 (or the specified port).
    
---
## Architecture Diagram 

```mermaid
    graph RL
        Application --> Users((Users))
        API_Pipeline --> Application
        API_Pipeline --> Custom_AI_Summarization
        Application <--> Custom_AI_Summarization
        User_Data[(User_Data)] --> Application
        Local_News --> API_Pipeline
        International_News --> API_Pipeline
        Miscellaneous_Sources --> API_Pipeline 
```

---
## Screenshots
![Screenshot 2024-12-31 at 22-08-24 React App](https://github.com/user-attachments/assets/90934b28-117d-4dda-9e51-133097ebabe1)

![Screenshot 2024-12-31 at 22-08-52 React App(2)](https://github.com/user-attachments/assets/df372086-0ea0-4b18-9e96-8df890fb22c6)

![Screenshot 2024-12-31 at 22-09-23 React App(1)](https://github.com/user-attachments/assets/9f9e5320-5942-4271-9c76-d543386ffd31)

![Screenshot from 2024-12-31 22-10-30](https://github.com/user-attachments/assets/b1f51cb0-b711-4715-b947-d679319cd8a5)
