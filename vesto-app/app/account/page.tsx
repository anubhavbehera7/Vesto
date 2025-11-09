import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  // Mock account data
  const account = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    stats: {
      pitches: 12,
      approved: 8,
      accuracy: 67,
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">
          Manage your profile and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how your profile appears</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-lg">{account.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{account.email}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Edit Profile</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simulator Stats</CardTitle>
          <CardDescription>Your performance with the AI Fund Manager</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Pitches Made</p>
              <p className="text-2xl font-semibold">{account.stats.pitches}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pitches Approved</p>
              <p className="text-2xl font-semibold">{account.stats.approved}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approval Rate</p>
              <p className="text-2xl font-semibold">{account.stats.accuracy}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p>Appearance</p>
            <Button variant="outline">Toggle Dark Mode</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive">Log Out</Button>
        </CardFooter>
      </Card>

    </div>
  );
}

