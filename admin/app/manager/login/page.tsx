"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8081/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("access_token", data.access_token);
                // Fetch profile to check status/role if needed, but for now just redirect
                // In a real app we'd decode token or fetch profile here.
                router.push("/dashboard/tournaments");
            } else {
                setError("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
            }
        } catch (err) {
            setError("서버 연결 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg border-0">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">BDR Admin 로그인</CardTitle>
                    <CardDescription className="text-center">
                        관리자 및 선생님 계정으로 로그인하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">아이디</Label>
                            <Input
                                id="username"
                                placeholder="아이디 입력"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="비밀번호"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                            {loading ? "로그인 중..." : "로그인"}
                        </Button>

                        <div className="flex items-center justify-between mt-4 text-sm">
                            <span className="text-gray-500">계정이 없으신가요?</span>
                            <span
                                className="text-blue-600 cursor-pointer hover:underline font-medium"
                                onClick={() => router.push("/manager/signup")}
                            >
                                선생님 회원가입
                            </span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
