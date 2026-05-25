import pyautogui
import time
import sys

def show_menu():
    print("\n" + "="*60)
    print(" 🤖 [Anti-Macro Ticket] 실시간 모의 해킹 매크로 시뮬레이터")
    print("="*60)
    print(" [1] 시나리오 A: 초고속 매크로 공격 (0.05초 만에 초고속 드로잉)")
    print("     -> [결과] 클라이언트/서버 행동분석 필터(소요시간 < 650ms)에 즉시 차단")
    print(" ")
    print(" [2] 시나리오 B: 지능형 지연 매크로 공격 (1.5초 동안 부드럽게 그리기)")
    print("     -> [결과] 속도 필터는 통과하지만, 기계적 오답 궤적으로 인한 AI 판독 불일치 차단")
    print(" ")
    print(" [3] 프로그램 종료")
    print("="*60)
    
    choice = input("👉 테스트할 공격 시나리오 번호를 입력하세요: ")
    return choice

def execute_attack(duration_time):
    print("\n" + "!"*60)
    print(" ⚠️ [필독] macOS 보안 권한 안내")
    print("     만약 마우스가 전혀 움직이지 않는다면, macOS 설정을 확인해야 합니다:")
    print("     👉 [시스템 설정 -> 개인정보 보호 및 보안 -> 손쉬운 사용(Accessibility)]")
    print("     이곳에서 실행 중인 터미널(Terminal.app 또는 VS Code)을 반드시 허용(ON)해 주세요.")
    print("!"*60)
    print("\n⏰ 5초 뒤 컴퓨터 마우스 자동 제어 물리 공격이 시작됩니다!")
    print("📌 5초 이내에 브라우저의 흰색 캡차 그림판(캔버스) 중앙에 마우스 커서를 가만히 올려두세요!")
    print("-"*60)
    
    for i in range(5, 0, -1):
        print(f"🚀 공격 시작 {i}초 전...")
        time.sleep(1)
        
    print("\n💥 [ATTACK ENGINE ACTIVATED] 물리 마우스 드로잉 주입을 시작합니다!")
    
    # 1. 사용자가 올려놓은 캔버스 중앙 마우스의 현재 해상도 절대 좌표 획득
    start_x, start_y = pyautogui.position()
    print(f"📍 물리 캔버스 감지 좌표: ({start_x}, {start_y})")
    
    # 안전장치 속도 설정 (과도하게 튕기는 것 방지)
    pyautogui.MINIMUM_DURATION = 0.01
    
    # 2. 정밀 마우스 드래그 동작 (DPI 보정이 적용된 웹 캔버스에 그리기)
    # mouseDown -> dragTo 구조보다 pyautogui.dragTo(..., button='left')를 쓰는 것이 OS간 마우스 잠김 현상을 방지하여 훨씬 안전합니다.
    pyautogui.mouseDown(start_x, start_y, button='left')
    
    try:
        # 기계적인 Z자 궤적 드로잉 주입
        pyautogui.dragTo(start_x + 100, start_y, duration=duration_time, button='left')
        pyautogui.dragTo(start_x + 30, start_y + 120, duration=duration_time, button='left')
        pyautogui.dragTo(start_x + 110, start_y + 120, duration=duration_time, button='left')
    finally:
        pyautogui.mouseUp(button='left')
    
    # 3. 드로잉 완료 후 안정적인 버튼 클릭을 위한 짧은 딜레이
    time.sleep(0.4)
    
    # 4. '인증 완료' 버튼 영역 정밀 타격 클릭
    # 캔버스 중앙(start_y) 기준으로 220px 아래 영역은 반응형 레이아웃에서 '인증 완료' 버튼이 정확히 위치하는 지점입니다.
    pyautogui.click(start_x + 50, start_y + 220)
    
    print("\n🎯 [물리 공격 시뮬레이션 완료]")
    print("   웹 브라우저에 나타난 실시간 보안 차단 화면과 콘솔/서버 로그를 확인해 보세요!")
    print("="*60)

def main():
    # 🚨 긴급 비상 종료 장치 (Fail-Safe) 활성화
    # 마우스 제어 중 제어가 불가능할 때 마우스 커서를 모니터 화면의 [맨 구석 네 모퉁이] 중 한 곳으로 강제로 밀어붙이면 프로그램이 즉시 즉사합니다.
    pyautogui.FAILSAFE = True
    
    while True:
        try:
            choice = show_menu()
            if choice == '1':
                # 0.05초 초고속 매크로
                execute_attack(0.05)
            elif choice == '2':
                # 1.5초 저속 매크로 (사람 손동작 모사 시도)
                execute_attack(0.7)
            elif choice == '3':
                print("👋 모의 침투 시뮬레이터를 종료합니다.")
                sys.exit()
            else:
                print("❌ 올바른 시나리오 번호를 선택해 주세요.")
        except KeyboardInterrupt:
            print("\n👋 프로그램을 종료합니다.")
            sys.exit()

if __name__ == "__main__":
    main()
