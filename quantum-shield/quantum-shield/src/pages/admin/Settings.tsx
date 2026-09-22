import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Settings as SettingsIcon, Shield, Bell, Key, Monitor } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-text-muted mt-1">Configure global framework parameters and security policies.</p>
        </div>
        <Button>
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <Monitor className="w-5 h-5 mr-2 text-primary" />
            <CardTitle>Appearance & General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface/50">
              <div>
                <h4 className="text-sm font-semibold text-text-main">Theme Interface</h4>
                <p className="text-xs text-text-muted mt-1">Select the default interface mode.</p>
              </div>
              <select className="px-3 py-2 bg-white border border-border rounded-lg text-sm">
                <option>System Default</option>
                <option>Light Mode</option>
                <option>Dark Mode</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            <CardTitle>Security Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface/50">
              <div>
                <h4 className="text-sm font-semibold text-text-main">Session Timeout</h4>
                <p className="text-xs text-text-muted mt-1">Automatically log out inactive users.</p>
              </div>
              <select className="px-3 py-2 bg-white border border-border rounded-lg text-sm">
                <option>15 Minutes</option>
                <option>30 Minutes</option>
                <option>1 Hour</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface/50">
              <div>
                <h4 className="text-sm font-semibold text-text-main">Require 2FA for Exam Centres</h4>
                <p className="text-xs text-text-muted mt-1">Enforce two-factor authentication for downloads.</p>
              </div>
              <input type="checkbox" className="rounded text-primary focus:ring-primary h-5 w-5 border-border" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center">
            <Bell className="w-5 h-5 mr-2 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface/50">
              <div>
                <h4 className="text-sm font-semibold text-text-main">Email Alerts</h4>
                <p className="text-xs text-text-muted mt-1">Receive emails for verification tampering events.</p>
              </div>
              <input type="checkbox" className="rounded text-primary focus:ring-primary h-5 w-5 border-border" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
