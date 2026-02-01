import os
import datetime

# --- 설정: 스냅샷에 포함할 파일 확장자와 무시할 폴더 ---
ALLOWED_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md', '.html'}
IGNORE_DIRS = {'node_modules', '.next', '.git', '.vscode', 'dist', 'build', 'public'} # public은 이미지라 제외(구조만 봄)
ENV_FILES = {'.env', '.env.local', '.env.development', '.env.production'}

# --- 오늘 작업한 문맥 (Context) 요약 ---
# 다음에 이 파일을 읽을 때, AI가 바로 상황을 파악하게 만드는 핵심 요약입니다.
PROJECT_CONTEXT = """
# PROJECT: Bamboo Forest (The Soul Shelter)
# DATE: {date}
# STATUS: Golden Master (Feature Complete)

# 1. KEY FEATURES IMPLEMENTED:
- Vapi AI Integration: Real-time voice conversation with emotional intelligence.
- Atmospheric Weather Engine: Rain, Snow, Ember particles reacting to emotions.
- Audio Engine: Adaptive background sounds & Cross-fading.
- Alive Spirit: Breathing, glowing, and scaling based on voice volume (Organic Response).
- Cinematic Polish: Film grain texture, Vignette, and Headphones intro layer.
- Parallax Depth: 3D effect on background, particles, and spirit using mouse/gyro.
- Memory System: Storing conversations as stars/flowers in the night sky (Supabase).
- Gamification (Resonance): Soul Level system (Mist -> Aurora) & Dynamic particle colors.
- UX Details: Swipe-to-dismiss gestures, PWA setup, Easter Egg (White Deer).

# 2. ARCHITECTURE:
- Frontend: Next.js 14 (App Router), Framer Motion, Tailwind CSS.
- Logic: Separated into `useBambooEngine` hook.
- Data: Supabase (Memories table).
- Voice: Vapi Web SDK.

# 3. NEXT STEPS:
- Deployment (Vercel).
- Mobile device testing (Gyroscope permission handling).
- User feedback loop.
"""

def mask_env_value(line):
    """환경변수 값 가리기 (보안)"""
    if '=' in line:
        key, _ = line.split('=', 1)
        return f"{key}=<HIDDEN_FOR_SECURITY>\n"
    return line

def generate_snapshot():
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    output_filename = "project_snapshot.txt"
    
    with open(output_filename, 'w', encoding='utf-8') as outfile:
        # 1. 문맥 정보 작성
        outfile.write(PROJECT_CONTEXT.format(date=timestamp))
        outfile.write("\n" + "="*50 + "\n\n")

        # 2. 프로젝트 폴더 구조 작성
        outfile.write("# PROJECT DIRECTORY STRUCTURE\n")
        for root, dirs, files in os.walk('.'):
            # 무시할 폴더 제거
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            level = root.replace('.', '').count(os.sep)
            indent = ' ' * 4 * (level)
            outfile.write(f"{indent}{os.path.basename(root)}/\n")
            subindent = ' ' * 4 * (level + 1)
            for f in files:
                outfile.write(f"{subindent}{f}\n")
        outfile.write("\n" + "="*50 + "\n\n")

        # 3. 주요 파일 소스코드 작성
        outfile.write("# SOURCE CODE CONTENTS\n")
        
        # 먼저 환경변수 파일 처리 (마스킹)
        for env_file in ENV_FILES:
            if os.path.exists(env_file):
                outfile.write(f"\n--- FILE: {env_file} ---\n")
                try:
                    with open(env_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            outfile.write(mask_env_value(line))
                except Exception as e:
                    outfile.write(f"Error reading env file: {e}\n")

        # 나머지 소스코드 파일 처리
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                _, ext = os.path.splitext(file)
                if ext in ALLOWED_EXTENSIONS and file not in ENV_FILES:
                    file_path = os.path.join(root, file)
                    outfile.write(f"\n--- FILE: {file_path} ---\n")
                    outfile.write("```" + ext[1:] + "\n") # 마크다운 코드 블록 시작
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            outfile.write(f.read())
                    except Exception as e:
                        outfile.write(f"Error reading file: {e}\n")
                    outfile.write("\n```\n") # 마크다운 코드 블록 끝

    print(f"✅ Snapshot created successfully: {output_filename}")
    print("This file contains the project context, structure, and masked source code.")

if __name__ == "__main__":
    generate_snapshot()