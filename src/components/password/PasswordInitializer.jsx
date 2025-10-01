import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Spinner from "@/components/Spinner";

const PasswordInitializer = ({ userInfo, onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const evaluatePasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("Au moins 8 caractères");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Une lettre majuscule");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Une lettre minuscule");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("Un chiffre");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Un caractère spécial");
    }

    return { score, feedback };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(evaluatePasswordStrength(value));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (passwordStrength.score < 4) { // Require at least 4 out of 5 criteria
      newErrors.password = "Le mot de passe n'est pas assez fort";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData.password);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score <= 3) return "bg-orange-500";
    return "bg-green-500";
  };

  const isCompany = userInfo?.type === 'company';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700 font-medium">
          Nouveau mot de passe *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Entrez votre nouveau mot de passe"
            value={formData.password}
            onChange={handleInputChange}
            className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500' : ''}`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Cacher le mot de passe" : "Montrer le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password}</p>
        )}
        
        {formData.password && (
          <div className="mt-2">
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <motion.div
                className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
          Confirmer le mot de passe *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`pl-10 pr-10 h-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showConfirmPassword ? "Cacher la confirmation" : "Montrer la confirmation"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <ul className="text-xs text-slate-600 space-y-1.5">
          <li className="flex items-center">
            <CheckCircle className={`h-3.5 w-3.5 mr-2 transition-colors ${formData.password.length >= 8 ? 'text-green-500' : 'text-slate-400'}`} />
            Au moins 8 caractères
          </li>
          <li className="flex items-center">
            <CheckCircle className={`h-3.5 w-3.5 mr-2 transition-colors ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`} />
            Une lettre majuscule
          </li>
          <li className="flex items-center">
            <CheckCircle className={`h-3.5 w-3.5 mr-2 transition-colors ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`} />
            Une lettre minuscule
          </li>
          <li className="flex items-center">
            <CheckCircle className={`h-3.5 w-3.5 mr-2 transition-colors ${/\d/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`} />
            Un chiffre
          </li>
          <li className="flex items-center">
            <CheckCircle className={`h-3.5 w-3.5 mr-2 transition-colors ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'}`} />
            Un caractère spécial
          </li>
        </ul>
      </div>

      <Button 
        type="submit" 
        className={`w-full h-12 text-white font-semibold rounded-lg transition-all duration-300 ${
          isCompany 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={loading || passwordStrength.score < 4}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Activation en cours...
          </>
        ) : (
          "Activer mon compte"
        )}
      </Button>
    </form>
  );
};

export default PasswordInitializer;