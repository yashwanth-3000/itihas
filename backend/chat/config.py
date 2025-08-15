import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ChatConfig:
    # IBM Watson Configuration
    IBM_API_KEY = os.getenv("IBM_API_KEY")
    IBM_WATSONX_URL = os.getenv("IBM_WATSONX_URL")
    IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID")
    
    # CrewAI Configuration  
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # Required for embeddings
    EXA_API_KEY = os.getenv("EXA_API_KEY")
    SERPER_API_KEY = os.getenv("SERPER_API_KEY")
    
    # Application Settings
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8001))  # Railway will override this
    RAILWAY_ENVIRONMENT = os.getenv("RAILWAY_ENVIRONMENT_NAME")  # Railway deployment detection
    
    # Chat-specific settings
    MAX_CONVERSATION_HISTORY = int(os.getenv("MAX_CONVERSATION_HISTORY", "10"))
    DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2000"))
    
    @classmethod
    def validate_config(cls):
        """Validate that required configuration is present"""
        required_vars = [
            "IBM_API_KEY",
            "IBM_WATSONX_URL", 
            "IBM_PROJECT_ID",
            "EXA_API_KEY"
        ]  # Removed OPENAI_API_KEY as it's optional
        
        missing_vars = []
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True 