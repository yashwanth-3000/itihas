#!/usr/bin/env python3
import os
import sys
import uvicorn

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import ExploreConfig


def main():
    ExploreConfig.validate_config()
    uvicorn.run(
        "main:app",
        host=ExploreConfig.HOST,
        port=ExploreConfig.PORT,
        reload=ExploreConfig.DEBUG,
        log_level="info",
    )


if __name__ == "__main__":
    main()

