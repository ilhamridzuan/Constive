'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { CreditCard, Save, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const pathname = usePathname();
  const { activeWorkspace, setActiveWorkspace, workspaces, fetchWorkspaces } =
    useWorkspaceStore();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const found = workspaces.find((w) => w.id === workspaceId);
      if (found) {
        setActiveWorkspace(found);
        setName(found.name);
        setSlug(found.slug);
      }
    }
  }, [workspaceId, workspaces, setActiveWorkspace]);

  const tabs = [
    { name: 'Pengaturan Umum', href: `/workspace/${workspaceId}/settings`, icon: Settings },
    { name: 'Anggota Tim', href: `/workspace/${workspaceId}/settings/members`, icon: Users },
    { name: 'Billing & Paket', href: `/workspace/${workspaceId}/settings/billing`, icon: CreditCard },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Pengaturan Workspace
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Kelola profil ruang kerja, anggota tim, hak akses RBAC, dan langganan billing.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border text-xs font-medium gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 pb-3 border-b-2 font-medium transition-colors ${
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.name}
            </Link>
          );
        })}
      </div>

      {/* General Workspace Settings Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Profil & Identitas Workspace</CardTitle>
          <CardDescription className="text-xs">
            Ubah nama perusahaan atau identifier unik ruang kerja ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <Label htmlFor="general-name">Nama Workspace</Label>
              <Input
                id="general-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="general-slug">Identifier URL (Slug)</Label>
              <Input
                id="general-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Domain URL workspace: <span className="font-mono text-foreground">constive.com/{slug}</span>
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                {isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
