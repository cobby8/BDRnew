"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
    id: string;
    username: string;
    name: string;
    schoolName: string;
    phoneNumber: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            // Fetch PENDING users
            const res = await fetch("http://localhost:8081/users/status/PENDING", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        if (!confirm(`${status === 'APPROVED' ? '승인' : '거절'} 하시겠습니까?`)) return;

        try {
            const res = await fetch(`http://localhost:8081/users/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                alert("처리되었습니다.");
                fetchUsers();
            } else {
                alert("처리 실패");
            }
        } catch (error) {
            alert("네트워크 오류");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">사용자 관리</h1>
            <Card>
                <CardHeader>
                    <CardTitle>승인 대기 목록</CardTitle>
                    <CardDescription>가입 신청한 선생님 목록입니다. 승인 후 이용 가능합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">대기 중인 요청이 없습니다.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>이름</TableHead>
                                    <TableHead>학교</TableHead>
                                    <TableHead>아이디</TableHead>
                                    <TableHead>연락처</TableHead>
                                    <TableHead>신청일</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead className="text-right">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.schoolName}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleStatusUpdate(user.id, 'APPROVED')}
                                            >
                                                <Check className="w-4 h-4 mr-1" /> 승인
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleStatusUpdate(user.id, 'REJECTED')}
                                            >
                                                <X className="w-4 h-4 mr-1" /> 거절
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
