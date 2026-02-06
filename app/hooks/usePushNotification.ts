// app/hooks/usePushNotification.ts
import { useState, useCallback } from 'react';

export function usePushNotification() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            alert("이 브라우저는 알림을 지원하지 않습니다.");
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            // [Demo] 권한 허용 즉시 테스트 알림 발송 (사용자 확인용)
            new Notification("숲의 정령", {
                body: "연결되었습니다. 당신의 마음을 기다릴게요.",
                icon: "/icons/icon-192x192.png", // PWA 아이콘 경로 확인 필요
            });
        }
    }, []);

    // 실제로는 서버에서 Push를 보내겠지만, 여기서는 클라이언트 스케줄링 시뮬레이션
    const scheduleDailyReminder = useCallback(() => {
        if (permission !== 'granted') return;
        
        // (실제 프로덕션에서는 Service Worker와 백엔드 Cron Job으로 처리해야 함)
        console.log("🔔 [System] Daily Whisper Scheduled");
    }, [permission]);

    return { permission, requestPermission, scheduleDailyReminder };
}