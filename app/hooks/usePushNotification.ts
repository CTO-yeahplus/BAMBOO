// app/hooks/usePushNotification.ts
import { useState, useCallback, useEffect } from 'react';
import { getFCMToken } from '../lib/firebase';
import { supabase } from '../utils/supabase';

export function usePushNotification() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            alert("이 브라우저는 알림을 지원하지 않습니다.");
            return;
        }

        try {
            const token = await getFCMToken();
            
            if (token) {
                setPermission('granted');
                console.log("FCM Token:", token);
                
                // [Sync] 토큰을 Supabase 'profiles' 테이블에 저장
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('profiles').update({ 
                        fcm_token: token 
                    }).eq('id', user.id);
                }

                // 환영 알림 테스트
                new Notification("숲의 정령", {
                    body: "당신의 영혼과 연결되었습니다. 이제 숲이 당신을 찾아갑니다.",
                    icon: "/icons/icon-192x192.png",
                });
            } else {
                setPermission('denied');
            }
        } catch (e) {
            console.error("Push Permission Error:", e);
        }
    }, []);

    return { permission, requestPermission };
}