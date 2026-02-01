"use client";

import { useState, useEffect } from "react";
import { User, UserRole } from "@/lib/types";
import { getUsers, deleteUser, adminAddUser, updateUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, UserPlus, Edit2, X, Shield, User as UserIcon, Mail } from "lucide-react";

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        role: "PARTICIPANT" as UserRole,
        password: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        const result = await getUsers();
        if (result.success) {
            setUsers(result.users);
        }
        setIsLoading(false);
    };

    const handleOpenAdd = () => {
        setFormData({ email: "", firstName: "", lastName: "", role: "PARTICIPANT", password: "" });
        setShowModal('add');
    };

    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            password: ""
        });
        setShowModal('edit');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        let result;
        if (showModal === 'add') {
            result = await adminAddUser(formData);
        } else {
            result = await updateUser(formData.email, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
                password: formData.password || undefined
            });
        }

        if (result.success) {
            fetchUsers();
            setShowModal(null);
        } else {
            alert(result.error || "Operation failed");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (email: string) => {
        if (!confirm(`Are you sure you want to delete user ${email}?`)) return;

        setIsDeleting(email);
        const result = await deleteUser(email);
        if (result.success) {
            setUsers(users.filter(u => u.email !== email));
        } else {
            alert("Failed to delete user");
        }
        setIsDeleting(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground mt-1">Manage platform participants and administrators.</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New User
                </Button>
            </div>

            {/* Responsive Table/Grid */}
            <div className="bg-card/50 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden self-stretch">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20">
                    <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="p-4 font-semibold text-xs uppercase tracking-wider w-1/2 md:w-auto">User</th>
                                <th className="p-4 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Role</th>
                                <th className="p-4 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell text-center">Joined</th>
                                <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user) => (
                                <tr key={user.email} className="hover:bg-muted/20 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px]">{user.firstName} {user.lastName}</div>
                                                <div className="text-[10px] text-muted-foreground flex items-center mt-0.5 truncate">
                                                    <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    <span className="truncate">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center w-fit ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary border border-primary/20' :
                                            user.role === 'ORGANIZER' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/20' :
                                                'bg-muted text-muted-foreground border border-border'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell text-center">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                onClick={() => handleOpenEdit(user)}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                onClick={() => handleDelete(user.email)}
                                                disabled={isDeleting === user.email || user.role === 'ADMIN'}
                                            >
                                                {isDeleting === user.email ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Modal Backdrop */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h3 className="text-xl font-bold">
                                    {showModal === 'add' ? 'Add New User' : 'Edit User'}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {showModal === 'add' ? 'Create a new account manually.' : `Updating ${editingUser?.email}`}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(null)} className="rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {showModal === 'add' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center">
                                        <Mail className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        required
                                        placeholder="user@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-muted/50 focus:bg-background transition-colors"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center">
                                        <UserIcon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                        First Name
                                    </label>
                                    <Input
                                        required
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="bg-muted/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Last Name</label>
                                    <Input
                                        required
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="bg-muted/50 focus:bg-background transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center">
                                    <Shield className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                    Access Level / Role
                                </label>
                                <select
                                    className="w-full flex h-10 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                >
                                    <option value="PARTICIPANT">Participant (Default)</option>
                                    <option value="ORGANIZER">Organizer</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">
                                    {showModal === 'add' ? 'Set Password' : 'Change Password (Optional)'}
                                </label>
                                <Input
                                    type="password"
                                    placeholder={showModal === 'add' ? "Min. 6 characters" : "Leave blank to keep current"}
                                    required={showModal === 'add'}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-muted/50 focus:bg-background transition-colors"
                                />
                                {showModal === 'edit' && <p className="text-[10px] text-muted-foreground italic mt-1">Passwords are encrypted and never stored in plain text.</p>}
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowModal(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {showModal === 'add' ? 'Create User' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
