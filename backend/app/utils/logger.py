"""
Production Logger Configuration

Provides structured logging for the application with different
formatters for development and production environments.
"""

import logging
import sys
import os
from datetime import datetime
from typing import Optional
import json


class JSONFormatter(logging.Formatter):
    """JSON formatter for production logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data
        
        return json.dumps(log_data, default=str)


class ColoredFormatter(logging.Formatter):
    """Colored formatter for development logging."""
    
    COLORS = {
        "DEBUG": "\033[36m",      # Cyan
        "INFO": "\033[32m",       # Green
        "WARNING": "\033[33m",    # Yellow
        "ERROR": "\033[31m",      # Red
        "CRITICAL": "\033[1;31m", # Bold Red
    }
    RESET = "\033[0m"
    
    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname}{self.RESET}"
        return super().format(record)


def setup_logger(
    name: str = "wcc",
    level: Optional[str] = None,
) -> logging.Logger:
    """
    Set up and configure the application logger.
    
    Args:
        name: Logger name
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        Configured logger instance
    """
    # Determine environment and log level
    is_production = os.getenv("NODE_ENV", "development") == "production"
    log_level = level or os.getenv("LOG_LEVEL", "INFO" if is_production else "DEBUG")
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Remove existing handlers
    logger.handlers.clear()
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Choose formatter based on environment
    if is_production:
        formatter = JSONFormatter()
    else:
        formatter = ColoredFormatter(
            fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Prevent propagation to root logger
    logger.propagate = False
    
    return logger


# Create default logger instance
logger = setup_logger()


def log_request(method: str, path: str, status: int, duration_ms: float):
    """Log HTTP request details."""
    logger.info(
        f"{method} {path} - {status} ({duration_ms:.2f}ms)",
        extra={"extra_data": {
            "method": method,
            "path": path,
            "status": status,
            "duration_ms": duration_ms
        }}
    )


def log_error(error: Exception, context: Optional[dict] = None):
    """Log error with context."""
    logger.error(
        str(error),
        exc_info=True,
        extra={"extra_data": context or {}}
    )

