"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        name: "",
        schoolName: "",
        phoneNumber: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8081/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("회원가입 요청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.");
                router.push("/manager/login");
            } else {
                const data = await res.json();
                setError(data.message || "회원가입 실패");
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
                    <CardTitle className="text-2xl font-bold text-center">선생님 회원가입</CardTitle>
                    <CardDescription className="text-center">
                        학교 스포츠 클럽 운영을 위한 계정을 생성합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">아이디</Label>
                            <Input
                                id="username"
                                placeholder="사용할 아이디"
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
                        <div className="space-y-2">
                            <Label htmlFor="name">이름 (실명)</Label>
                            <Input
                                id="name"
                                placeholder="홍길동"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="schoolName">학교명</Label>
                            <Input
                                id="schoolName"
                                placeholder="서울고등학교"
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">연락처</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="010-1234-5678"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? "가입 요청 중..." : "회원가입 요청"}
                        </Button>

                        <div className="text-center text-sm text-gray-500 mt-4">
                            이미 계정이 있으신가요?{" "}
                            <span
                                className="text-blue-600 cursor-pointer hover:underline"
                                onClick={() => router.push("/manager/login")}
                            >
                                로그인
                            </span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
