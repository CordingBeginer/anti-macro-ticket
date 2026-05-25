import pyautogui
import time
import sys

def show_menu():
    print("\n" + "="*50)
    print(" 🤖 [Anti-Macro Ticket] 실시간 모의 해킹 매크로 시뮬레이터")
    print("="*50)
    print(" [1] 시나리오 A: 초고속 매크로 공격 (0.1초 만에 드로잉 & 우회)")
    print("     -> 시간/획수 허니팟 필터에 걸려 차단되는지 테스트")
    print(" [2] 시나리오 B: 지능형 지연 매크로 공격 (1.5초 천천히 그리기)")
    print("     -> 속도 필터는 피하지만, 동적 수학문제 오답으로 차단되는지 테스트")
    print(" [3] 프로그램 종료")
    print("="*50)
    
    choice = input("👉 테스트할 공격 시나리오 번호를 입력하세요: ")
    return choice

def execute_attack(duration_time, draw_wrong_answer=True):
    print("\n⚠️ 5초 뒤에 컴퓨터 마우스 자동 제어 공격이 개시됩니다!")
    print("⚠️ 5초 이내에 브라우저 캡차 그림판(캔버스) 중앙에 마우스 커서를 올려두세요!")
    print("-"*50)
    
    for i in range(5, 0, -1):
        print(f"🚀 공격 개시 {i}초 전...")
        time.sleep(1)
        
    print("\n💥 [ATTACK ENGINE ACTIVED] 마우스 제어를 시작합니다!")
    
    # 1. 캔버스 위 현재 마우스 위치 가져오기
    start_x, start_y = pyautogui.position()
    print(f"📍 캔버스 감지 좌표: ({start_x}, {start_y})")
    
    # 2. 자동 드로잉 (마우스를 누르고 획을 긋는 드래그 제어)
    pyautogui.mouseDown(start_x, start_y, button='left')
    
    # 기계적인 선 그리기
    pyautogui.dragTo(start_x + 100, start_y, duration=duration_time)
    pyautogui.dragTo(start_x + 30, start_y + 150, duration=duration_time)
    
    pyautogui.mouseUp(button='left')
    
    # 3. 약간의 딜레이 후 버튼 자동 클릭
    time.sleep(0.3)
    # 현재 시작좌표 기준 아래쪽 220px 영역에 위치한 '인증 완료' 버튼 위치 자동 클릭
    pyautogui.click(start_x + 50, start_y + 220)
    
    print("\n🎯 [공격 시뮬레이션 완료]")
    print("   브라우저에 나타난 차단 결과와 도커 터미널 경고 로그를 확인해보세요!")
    print("="*50)

def main():
    # PyAutoGUI의 Fail-Safe 기능 활성화 (마우스를 모니터 네 귀퉁이 구석으로 가져가면 강제 종료됩니다)
    pyautogui.FAILSAFE = True
    
    while True:
        try:
            choice = show_menu()
            if choice == '1':
                # 0.05초짜리 초고속 매크로
                execute_attack(0.05)
            elif choice == '2':
                # 1.5초 동안 사람처럼 부드럽고 천천히 그리는 매크로
                execute_attack(1.5)
            elif choice == '3':
                print("👋 모의 침투 테스트 프로그램을 종료합니다.")
                sys.exit()
            else:
                print("❌ 올바른 번호를 선택해주세요.")
        except KeyboardInterrupt:
            print("\n👋 프로그램을 중단합니다.")
            sys.exit()

if __name__ == "__main__":
    main()
