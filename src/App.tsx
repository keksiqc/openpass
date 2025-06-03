import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Toaster } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, RefreshCw, RotateCcwKey, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ModeToggle } from "./components/mode-toggle"

// Common word list for passphrases
const COMMON_WORDS = [
  "apple",
  "brave",
  "chair",
  "dance",
  "eagle",
  "flame",
  "grace",
  "house",
  "image",
  "juice",
  "knife",
  "light",
  "music",
  "night",
  "ocean",
  "peace",
  "quick",
  "river",
  "stone",
  "table",
  "under",
  "voice",
  "water",
  "youth",
  "zebra",
  "beach",
  "cloud",
  "dream",
  "earth",
  "field",
  "green",
  "happy",
  "island",
  "jolly",
  "magic",
  "noble",
  "power",
  "quiet",
  "smile",
  "trust",
  "unity",
  "value",
  "world",
  "young",
  "bright",
  "clear",
  "fresh",
  "giant",
  "heart",
  "lucky",
]

interface PasswordProfile {
  id: string
  name: string
  type: "password" | "passphrase" | "format"
  settings: any
}

interface PasswordSettings {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  customCharacters: string
  excludeSimilar: boolean
}

interface PassphraseSettings {
  wordCount: number
  separator: string
  capitalize: boolean
  includeNumbers: boolean
}

interface FormatSettings {
  format: string
}

export default function App() {
  // State for generated results
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [generatedPassphrase, setGeneratedPassphrase] = useState("")
  const [generatedFormat, setGeneratedFormat] = useState("")

  // Settings states
  const [passwordSettings, setPasswordSettings] = useState<PasswordSettings>({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
    customCharacters: "",
    excludeSimilar: false,
  })

  const [passphraseSettings, setPassphraseSettings] = useState<PassphraseSettings>({
    wordCount: 4,
    separator: "-",
    capitalize: false,
    includeNumbers: false,
  })

  const [formatSettings, setFormatSettings] = useState<FormatSettings>({
    format: "1u4l1{#$%}4d",
  })

  // Profile management
  const [profiles, setProfiles] = useState<PasswordProfile[]>([])
  const [profileName, setProfileName] = useState("")
  const [activeTab, setActiveTab] = useState("password")

  // Load profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem("openpass-profiles")
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles))
    }
  }, [])

  // Save profiles to localStorage
  const saveProfilesToStorage = (newProfiles: PasswordProfile[]) => {
    localStorage.setItem("openpass-profiles", JSON.stringify(newProfiles))
    setProfiles(newProfiles)
  }

  // Character sets
  const getCharacterSet = (settings: PasswordSettings): string => {
    let charset = ""

    if (settings.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (settings.includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (settings.includeNumbers) charset += "0123456789"
    if (settings.includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if (settings.customCharacters) charset += settings.customCharacters

    if (settings.excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, "")
    }

    return charset
  }

  // Secure random number generation
  const getSecureRandom = (max: number): number => {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] % max
  }

  // Generate password
  const generatePassword = () => {
    const charset = getCharacterSet(passwordSettings)
    if (!charset) {
      toast.error("Please select at least one character type")
      return
    }

    let password = ""
    for (let i = 0; i < passwordSettings.length; i++) {
      password += charset[getSecureRandom(charset.length)]
    }

    setGeneratedPassword(password)
    toast.success("Password generated successfully!")
  }

  // Generate passphrase
  const generatePassphrase = () => {
    const words = []
    for (let i = 0; i < passphraseSettings.wordCount; i++) {
      let word = COMMON_WORDS[getSecureRandom(COMMON_WORDS.length)]
      if (passphraseSettings.capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1)
      }
      words.push(word)
    }

    let passphrase = words.join(passphraseSettings.separator === "none" ? "" : passphraseSettings.separator)

    if (passphraseSettings.includeNumbers) {
      passphrase += getSecureRandom(100).toString().padStart(2, "0")
    }

    setGeneratedPassphrase(passphrase)
    toast.success("Passphrase generated successfully!")
  }

  // Parse and generate format-based password
  const generateFormatPassword = () => {
    const format = formatSettings.format
    let result = ""
    let i = 0

    try {
      while (i < format.length) {
        if (/\d/.test(format[i])) {
          // Parse number
          let numStr = ""
          while (i < format.length && /\d/.test(format[i])) {
            numStr += format[i]
            i++
          }
          const count = Number.parseInt(numStr)

          if (i >= format.length) break

          const type = format[i]
          let charset = ""

          switch (type) {
            case "u":
              charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
              break
            case "l":
              charset = "abcdefghijklmnopqrstuvwxyz"
              break
            case "d":
              charset = "0123456789"
              break
            case "{":
              // Parse custom character set
              i++ // skip '{'
              let customSet = ""
              while (i < format.length && format[i] !== "}") {
                customSet += format[i]
                i++
              }
              charset = customSet
              break
            default:
              throw new Error(`Unknown format type: ${type}`)
          }

          // Generate characters
          for (let j = 0; j < count; j++) {
            if (charset) {
              result += charset[getSecureRandom(charset.length)]
            }
          }
        }
        i++
      }

      setGeneratedFormat(result)
      toast.success("Format password generated successfully!")
    } catch {
      toast.error("Invalid format. Use: Nu (uppercase), Nl (lowercase), Nd (digits), N{chars} (custom)")
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  // Save profile
  const saveProfile = () => {
    if (!profileName.trim()) {
      toast.error("Please enter a profile name")
      return
    }

    const newProfile: PasswordProfile = {
      id: Date.now().toString(),
      name: profileName,
      type: activeTab as any,
      settings:
        activeTab === "password" ? passwordSettings : activeTab === "passphrase" ? passphraseSettings : formatSettings,
    }

    const newProfiles = [...profiles, newProfile]
    saveProfilesToStorage(newProfiles)
    setProfileName("")

    toast.success(`Profile "${newProfile.name}" saved successfully!`)
  }

  // Load profile
  const loadProfile = (profile: PasswordProfile) => {
    setActiveTab(profile.type)

    switch (profile.type) {
      case "password":
        setPasswordSettings(profile.settings)
        break
      case "passphrase":
        setPassphraseSettings(profile.settings)
        break
      case "format":
        setFormatSettings(profile.settings)
        break
    }

    toast.success(`Profile "${profile.name}" loaded successfully!`)
  }

  // Delete profile
  const deleteProfile = (profileId: string) => {
    const newProfiles = profiles.filter((p) => p.id !== profileId)
    saveProfilesToStorage(newProfiles)
    toast.success("Profile deleted successfully!")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <RotateCcwKey className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">OpenPass</h1>
              <p className="text-muted-foreground">Secure Local Password Generator</p>
            </div>
          </div>
          <ModeToggle />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Generator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Password Generator
                </CardTitle>
                <CardDescription>Generate secure passwords, passphrases, and custom formats</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
                    <TabsTrigger value="format">Format</TabsTrigger>
                  </TabsList>

                  {/* Password Tab */}
                  <TabsContent value="password" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Length: {passwordSettings.length}</Label>
                        <Slider
                          value={[passwordSettings.length]}
                          onValueChange={(value) => setPasswordSettings({ ...passwordSettings, length: value[0] })}
                          max={128}
                          min={4}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="uppercase"
                            checked={passwordSettings.includeUppercase}
                            onCheckedChange={(checked) =>
                              setPasswordSettings({ ...passwordSettings, includeUppercase: !!checked })
                            }
                          />
                          <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="lowercase"
                            checked={passwordSettings.includeLowercase}
                            onCheckedChange={(checked) =>
                              setPasswordSettings({ ...passwordSettings, includeLowercase: !!checked })
                            }
                          />
                          <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="numbers"
                            checked={passwordSettings.includeNumbers}
                            onCheckedChange={(checked) =>
                              setPasswordSettings({ ...passwordSettings, includeNumbers: !!checked })
                            }
                          />
                          <Label htmlFor="numbers">Numbers (0-9)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="symbols"
                            checked={passwordSettings.includeSymbols}
                            onCheckedChange={(checked) =>
                              setPasswordSettings({ ...passwordSettings, includeSymbols: !!checked })
                            }
                          />
                          <Label htmlFor="symbols">Symbols (!@#$...)</Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="custom" className="mb-1">Custom Characters</Label>
                        <Input
                          id="custom"
                          value={passwordSettings.customCharacters}
                          onChange={(e) =>
                            setPasswordSettings({ ...passwordSettings, customCharacters: e.target.value })
                          }
                          placeholder="Add custom characters..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="exclude-similar"
                          checked={passwordSettings.excludeSimilar}
                          onCheckedChange={(checked) =>
                            setPasswordSettings({ ...passwordSettings, excludeSimilar: !!checked })
                          }
                        />
                        <Label htmlFor="exclude-similar">Exclude similar characters (0, O, 1, l, I)</Label>
                      </div>
                    </div>

                    <Button onClick={generatePassword} className="w-full" size="lg">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Password
                    </Button>

                    {generatedPassword && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Generated Password
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={generatedPassword}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedPassword)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Passphrase Tab */}
                  <TabsContent value="passphrase" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Word Count: {passphraseSettings.wordCount}</Label>
                        <Slider
                          value={[passphraseSettings.wordCount]}
                          onValueChange={(value) =>
                            setPassphraseSettings({ ...passphraseSettings, wordCount: value[0] })
                          }
                          max={8}
                          min={2}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="separator">Separator</Label>
                        <Select
                          value={passphraseSettings.separator}
                          onValueChange={(value) => setPassphraseSettings({ ...passphraseSettings, separator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="-">Hyphen (-)</SelectItem>
                            <SelectItem value="_">Underscore (_)</SelectItem>
                            <SelectItem value=" ">Space ( )</SelectItem>
                            <SelectItem value=".">Period (.)</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="capitalize"
                          checked={passphraseSettings.capitalize}
                          onCheckedChange={(checked) =>
                            setPassphraseSettings({ ...passphraseSettings, capitalize: !!checked })
                          }
                        />
                        <Label htmlFor="capitalize">Capitalize first letter of each word</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-numbers"
                          checked={passphraseSettings.includeNumbers}
                          onCheckedChange={(checked) =>
                            setPassphraseSettings({ ...passphraseSettings, includeNumbers: !!checked })
                          }
                        />
                        <Label htmlFor="include-numbers">Add numbers at the end</Label>
                      </div>
                    </div>

                    <Button onClick={generatePassphrase} className="w-full" size="lg">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Passphrase
                    </Button>

                    {generatedPassphrase && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Generated Passphrase
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={generatedPassphrase}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedPassphrase)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Format Tab */}
                  <TabsContent value="format" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="format">Format Pattern</Label>
                        <Input
                          id="format"
                          value={formatSettings.format}
                          onChange={(e) => setFormatSettings({ ...formatSettings, format: e.target.value })}
                          placeholder="e.g., 1u4l1{#$%}4d"
                        />
                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                          <p className="font-medium mb-2">Format Guide:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              <code className="bg-muted px-1 rounded">Nu</code> - N uppercase letters
                            </li>
                            <li>
                              <code className="bg-muted px-1 rounded">Nl</code> - N lowercase letters
                            </li>
                            <li>
                              <code className="bg-muted px-1 rounded">Nd</code> - N digits
                            </li>
                            <li>
                              <code className="bg-muted px-1 rounded">
                                N{String.fromCharCode(123)}chars{String.fromCharCode(125)}
                              </code>{" "}
                              - N characters from custom set
                            </li>
                          </ul>
                          <p className="mt-2">
                            <span className="font-medium">Example:</span>{" "}
                            <code className="bg-muted px-1 rounded">
                              1u4l1{String.fromCharCode(123)}#$%{String.fromCharCode(125)}4d
                            </code>{" "}
                            → <code className="bg-muted px-1 rounded">Gylwm$8158</code>
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button onClick={generateFormatPassword} className="w-full" size="lg">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Format Password
                    </Button>

                    {generatedFormat && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Generated Format Password
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={generatedFormat}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedFormat)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Profile Management */}
          <div className="space-y-6">
            {/* Save Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Save Profile</CardTitle>
                <CardDescription>Save current settings as a profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Profile name..."
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
                <Button onClick={saveProfile} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            {/* Saved Profiles */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Profiles</CardTitle>
                <CardDescription>Load or delete saved profiles</CardDescription>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No saved profiles</p>
                ) : (
                  <div className="space-y-3">
                    {profiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{profile.name}</span>
                            <Badge variant="secondary">{profile.type}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => loadProfile(profile)}>
                            Load
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteProfile(profile.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

