import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Bot, Search, MessageSquare, Settings, Sparkles } from 'lucide-react';

interface WelcomeGuideProps {
  onComplete: () => void;
}

const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to CodeCraft AI",
      description: "Your intelligent AI coding companion with advanced search capabilities",
      icon: Bot,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Started with CodeCraft AI</h3>
            <p className="text-muted-foreground">
              A powerful AI assistant that combines multiple specialized agents with web search capabilities 
              to help you with coding, debugging, documentation, and more.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium">Smart Conversations</h4>
              <p className="text-sm text-muted-foreground">Persistent conversation history with intelligent context</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <Search className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium">Web Search Integration</h4>
              <p className="text-sm text-muted-foreground">Real-time search with multiple provider options</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your AI Agents",
      description: "Select from specialized agents for different tasks",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            CodeCraft AI offers multiple specialized agents, each optimized for specific tasks:
          </p>
          <div className="space-y-3">
            {[
              { name: "Code Generation", desc: "Generate clean, efficient code in any language", color: "bg-blue-100 text-blue-800" },
              { name: "Bug Fix Agent", desc: "Identify and fix bugs in your code", color: "bg-red-100 text-red-800" },
              { name: "Documentation", desc: "Create comprehensive documentation", color: "bg-green-100 text-green-800" },
              { name: "Refactor Agent", desc: "Improve code structure and performance", color: "bg-purple-100 text-purple-800" },
              { name: "Test Generator", desc: "Generate comprehensive test suites", color: "bg-orange-100 text-orange-800" }
            ].map((agent, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className={agent.color}>{agent.name}</Badge>
                <p className="text-sm text-muted-foreground">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Configure Search Settings",
      description: "Set up web search for real-time information",
      icon: Search,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Enable web search to get up-to-date information and enhance AI responses:
          </p>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">DuckDuckGo (Free)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Privacy-focused search engine - no API key required
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">SerpApi (Premium)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Google search results with high accuracy - requires API key
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-medium">Tavily AI (Research)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered search optimized for research - requires API key
              </p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 You can configure search settings later in the Settings menu
            </p>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      description: "Start using CodeCraft AI",
      icon: CheckCircle,
      content: (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Ready to Code!</h3>
          <p className="text-muted-foreground">
            You're all set to start using CodeCraft AI. Your conversations will be automatically 
            saved, and you can access them anytime from the conversation history.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Quick Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Use the agent selector to switch between different AI specialists</li>
              <li>• Access settings to configure search providers and other preferences</li>
              <li>• View conversation history to review past interactions</li>
              <li>• Your data is securely stored and synchronized across devices</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <currentStepData.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </span>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeGuide;