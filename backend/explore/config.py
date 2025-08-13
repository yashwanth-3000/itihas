import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables (search upwards so running from subdirs works)
load_dotenv(find_dotenv(), override=False)


class ExploreConfig:
    """Configuration for the Explore agentic workflow."""

    # IBM Watson Configuration
    IBM_API_KEY = os.getenv("IBM_API_KEY")
    IBM_WATSONX_URL = os.getenv("IBM_WATSONX_URL")
    IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID")

    # Integrations
    EXA_API_KEY = os.getenv("EXA_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # Only for embeddings if memory is enabled

    # Application Settings
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    HOST = os.getenv("EXPLORE_HOST", os.getenv("HOST", "0.0.0.0"))
    PORT = int(os.getenv("EXPLORE_PORT", 8002))  # Different port for explore API

    # LLM defaults
    DEFAULT_TEMPERATURE = float(os.getenv("EXPLORE_TEMPERATURE", os.getenv("DEFAULT_TEMPERATURE", "0.3")))
    MAX_TOKENS = int(os.getenv("EXPLORE_MAX_TOKENS", os.getenv("MAX_TOKENS", "2000")))

    @classmethod
    def validate_config(cls):
        """Validate required configuration presence."""
        required_vars = [
            "IBM_API_KEY",
            "IBM_WATSONX_URL",
            "IBM_PROJECT_ID",
            "EXA_API_KEY",
            # OPENAI_API_KEY is optional if memory is disabled
        ]

        missing_vars = []
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)

        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

        return True

