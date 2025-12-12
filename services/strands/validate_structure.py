#!/usr/bin/env python3

# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

"""
Simple validation script to check the Strands service structure.
This script validates the basic structure without requiring dependencies.
"""

import os
import sys
from pathlib import Path

def validate_structure():
    """Validate the Strands service structure."""
    print("🔍 Validating Strands service structure...")
    
    # Check required files exist
    required_files = [
        "main.py",
        "config.py", 
        "logging_config.py",
        "requirements.txt",
        "Dockerfile",
        ".env.example",
        "README.md"
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
        else:
            print(f"✅ {file}")
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    
    # Check Python syntax
    python_files = ["main.py", "config.py", "logging_config.py"]
    for file in python_files:
        try:
            with open(file, 'r') as f:
                compile(f.read(), file, 'exec')
            print(f"✅ {file} - syntax OK")
        except SyntaxError as e:
            print(f"❌ {file} - syntax error: {e}")
            return False
    
    # Check requirements.txt format
    try:
        with open("requirements.txt", 'r') as f:
            lines = f.readlines()
            if len(lines) < 5:  # Should have multiple dependencies
                print("❌ requirements.txt seems incomplete")
                return False
            print(f"✅ requirements.txt - {len(lines)} dependencies")
    except Exception as e:
        print(f"❌ requirements.txt error: {e}")
        return False
    
    # Check Dockerfile
    try:
        with open("Dockerfile", 'r') as f:
            content = f.read()
            if "FROM python:" not in content:
                print("❌ Dockerfile missing Python base image")
                return False
            if "EXPOSE 8080" not in content:
                print("❌ Dockerfile missing port exposure")
                return False
            print("✅ Dockerfile - structure OK")
    except Exception as e:
        print(f"❌ Dockerfile error: {e}")
        return False
    
    print("\n🎉 Strands service structure validation completed successfully!")
    print("📋 Summary:")
    print("   - FastAPI application structure ✅")
    print("   - Configuration management ✅") 
    print("   - Logging setup ✅")
    print("   - Docker configuration ✅")
    print("   - Dependencies defined ✅")
    print("   - Documentation ✅")
    
    return True

if __name__ == "__main__":
    success = validate_structure()
    sys.exit(0 if success else 1)