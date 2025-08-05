"""
Comic generation module for AI-powered comic book creation.

This module contains all the components needed for generating comics:
- CrewAI agents for story and image generation
- Task definitions for comic creation workflow
- Configuration and utilities for comic generation
"""

__version__ = "1.0.0"

# Import main components for easy access
from .agents import *
from .tasks import *
from .config import * 