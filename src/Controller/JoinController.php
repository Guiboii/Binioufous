<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class JoinController extends AbstractController
{
    /**
     * @Route("/join", name="join")
     */
    public function index()
    {
        return $this->render('join/index.html.twig', [
            'controller_name' => 'JoinController',
        ]);
    }
}
