# Employment Opportunities Application Flow

```mermaid
flowchart TB
    %% Main User Entry Point
    Start([Start]) ==> LandingPage[Landing Page]
    
    %% Authentication Flows
    subgraph Authentication
        direction TB
        LandingPage ==> AuthModal[Authentication Modal]
        AuthModal ==> Login{Login or Signup?}
        
        %% Login Flow
        Login -->|Login| CredentialsLogin[Email & Password]
        Login -->|Signup| SignupForm[Registration Form]
        Login -->|OAuth| GoogleLogin[Google Authentication]
        CredentialsLogin --> CheckVerification[Check Email Verification]
        
        %% Login Verification Process
        CheckVerification -->|Verified| LoginSuccess[Login Success]
        CheckVerification -->|Not Verified| VerificationNeeded[Email Verification Needed]
        VerificationNeeded --> SendVerificationEmail[Send Verification Email]
        SendVerificationEmail --> UserEmail[(User's Email)]
        
        %% Signup Flow
        SignupForm --> ValidateSignup[Validate Inputs]
        ValidateSignup --> CreateUser[Create User Account]
        CreateUser --> SendVerificationEmail
        
        %% Password Reset Flow
        LandingPage -->|Forgot Password| ForgotPassword[Forgot Password Form]
        ForgotPassword --> ValidateEmail[Validate Email]
        ValidateEmail --> SendResetLink[Send Reset Link]
        SendResetLink --> UserEmail
        
        %% Verification and Success Paths
        UserEmail -->|Click Reset Link| ResetPassword[Reset Password Form]
        ResetPassword --> UpdatePassword[Update Password]
        UserEmail -->|Click Verification Link| VerifyAccount[Verify Account]
        
        %% Success Paths
        VerifyAccount ==> LoginSuccess
        GoogleLogin ==> LoginSuccess
        UpdatePassword ==> LoginSuccess
    end
    
    %% Dashboard and Main User Flows
    LoginSuccess ==> Dashboard[User Dashboard]
    
    subgraph MainApplication
        direction TB
        Dashboard ==> Navigation{Navigate To}
        
        %% Main Navigation Options
        Navigation -->|Chat| ChatSection[AI Chat Interface]
        Navigation -->|Career Compass| CareerCompass[Career Compass Tool]
        Navigation -->|Job Aggregator| Aggregator[Job Resources]
        Navigation -->|Interview Prep| InterviewPrep[Interview Preparation]
        
        %% Sidebar Navigation
        SidebarNav[Sidebar Navigation] --- UserProfile[User Profile]
        SidebarNav --- AppMenu[Application Menu]
        SidebarNav --- LogOut[Log Out]
        AppMenu ==> Navigation
        
        %% Chat Flow
        subgraph AIChatFlow
            direction TB
            ChatSection --> NewChat[New Chat]
            ChatSection --> ChatHistory[Chat History]
            
            NewChat --> UserMessage[User Message]
            ChatHistory --> PreviousChat[Previous Chat]
            PreviousChat --> UserMessage
            
            UserMessage --> AIProcessing{AI Processing}
            AIProcessing -->|Using Tools| ToolCalling[Tool Calling]
            AIProcessing -->|Direct| DirectResponse[Direct Response]
            
            %% Chat Storage
            Redis[(Upstash Redis)]
            
            UserMessage ---> Redis
            ChatHistory ---> Redis
            ToolCalling ---> Redis
            DirectResponse ---> Redis
            
            ToolCalling ==> AIResponse[AI Response with Tool Results]
            DirectResponse ==> AIResponse
            AIResponse ==> UserMessage
        end
    end
    
    %% Career Compass - Now separate from CareerTools
    subgraph CareerCompassFlow
        direction TB
        CareerCompass --> ResumeUpload[Resume Upload]
        CareerCompass --> ManualDetails[Manual Career Details]
        
        %% ML Pipeline for Career Compass
        subgraph MLPipeline[Career Compass ML Pipeline]
            direction LR
            InitialVector[Initial Vectorization]
            RandomForest[Random Forest Model]
            SecondVector[Second Vectorization]
            LLMProcessing[LLM Processing]
            AIResults[AI Results]
            
            InitialVector ==> RandomForest
            RandomForest ==> SecondVector
            SecondVector ==> LLMProcessing
            LLMProcessing ==> AIResults
        end
        
        %% Corrected paths for Resume Upload and Manual Details
        ResumeUpload ==> InitialVector
        ManualDetails ==> RandomForest
        
        AIResults ==> CareerVisualization[Career Data Visualization]
    end
    
    %% Job Aggregator - Now separate 
    subgraph JobAggregatorFlow
        direction TB
        Aggregator --> JobSearch[Search Resources]
        JobSearch --> FilterOptions[Filter Options]
        FilterOptions --> JobResources[Curated Job Resources]
        JobResources --> SavedJobs[Saved Jobs]
    end
    
    %% Interview Prep - Now separate
    subgraph InterviewPrepFlow
        direction TB
        InterviewPrep --> InterviewTopics[Interview Topics]
        InterviewTopics --> SkillAssessment[Skill Assessment]
        SkillAssessment --> MockInterview[Mock Interview]
        MockInterview --> FeedbackAnalysis[Feedback Analysis]
    end
    
    %% Main Paths
    Dashboard --- SidebarNav
    LogOut ==> LandingPage
    
    %% Styling - Enhanced with more attractive colors and better contrast
    classDef primary fill:#22c55e,stroke:#047857,color:white,stroke-width:2px,rx:5px
    classDef secondary fill:#1e293b,stroke:#334155,color:white,stroke-width:1px,rx:3px
    classDef accent fill:#3b82f6,stroke:#1e40af,color:white,stroke-width:1px,rx:4px
    classDef error fill:#ef4444,stroke:#b91c1c,color:white,stroke-width:1px,rx:3px
    classDef success fill:#10b981,stroke:#047857,color:white,stroke-width:1px,rx:3px
    classDef decision fill:#8b5cf6,stroke:#6d28d9,color:white,stroke-width:1px,rx:10px
    classDef database fill:#f59e0b,stroke:#d97706,color:white,stroke-width:1px,rx:3px
    classDef ml fill:#ec4899,stroke:#be185d,color:white,stroke-width:1px,rx:3px
    classDef aggregator fill:#7c3aed,stroke:#5b21b6,color:white,stroke-width:1px,rx:3px
    classDef interview fill:#2dd4bf,stroke:#0d9488,color:white,stroke-width:1px,rx:3px
    
    %% Apply styling to nodes
    class Start,LandingPage,Dashboard,ChatSection,CareerCompass,Aggregator,InterviewPrep primary
    class AuthModal,SignupForm,ForgotPassword,ResetPassword,Navigation secondary
    class AIProcessing,ToolCalling,AIResponse accent
    class VerificationNeeded,ValidateSignup error
    class LoginSuccess,VerifyAccount,UpdatePassword success
    class Login,AIProcessing decision
    class UserEmail,Redis database
    class InitialVector,RandomForest,SecondVector,LLMProcessing,AIResults ml
    class JobSearch,FilterOptions,JobResources,SavedJobs aggregator
    class InterviewTopics,SkillAssessment,MockInterview,FeedbackAnalysis interview
```

This diagram visualizes the complete user flow in the Employment Opportunities application, from authentication to using the AI-powered features.

## Key User Flows

1. **Authentication**
   - Users can sign in with email/password or Google OAuth
   - New users can register and must verify their email
   - Password reset functionality is available

2. **Dashboard Navigation**
   - Central dashboard with access to all application features
   - Persistent sidebar for navigation between sections

3. **AI Chat Experience**
   - Users can start new chats or continue previous conversations
   - AI processes user messages and may use special tools
   - All chat data is persisted in Upstash Redis database
   - Responses are rendered back to users in a conversational interface

4. **Career Compass**
   - Two input methods with different processing paths:
     - Resume Upload: Goes through full ML pipeline (vectorization → Random Forest → second vectorization → LLM)
     - Manual Details: Bypasses vectorization (directly to Random Forest → LLM)
   - Provides career data visualization from AI analysis results

5. **Job Aggregator**
   - Search and filter job resources
   - Curated job listings from multiple sources
   - Save favorite job opportunities

6. **Interview Preparation**
   - Topic selection for interview practice
   - Skill assessment to identify strengths and weaknesses
   - Interactive mock interviews
   - Detailed feedback and improvement analysis